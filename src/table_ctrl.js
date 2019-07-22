import _ from 'lodash';
import $ from 'jquery';
import {MetricsPanelCtrl} from 'app/plugins/sdk';
import {transformDataToTable} from './transformers';
import {tablePanelEditor} from './editor';
import {columnOptionsTab} from './column_options';
import {TableRenderer} from './renderer';

import * as form from './addMaterial'
import * as utils from './utils'
import * as materialOption from './materialOptions'

import './css/style.css!';
import './css/instant-serach.css!';

const panelDefaults = {
  targets: [{}],
  transform: 'timeseries_to_columns',
  pageSize: null,
  showHeader: true,
  styles: [
    {
      type: 'date',
      pattern: 'Time',
      alias: 'Time',
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
      headerColor: "rgba(51, 181, 229, 1)"
    },
    {
      unit: 'short',
      type: 'number',
      alias: '',
      decimals: 2,
      headerColor: "rgba(51, 181, 229, 1)",
      colors: ["rgba(245, 54, 54, 0.9)", "rgba(237, 129, 40, 0.89)", "rgba(50, 172, 45, 0.97)"],
      colorMode: null,
      pattern: '/.*/',
      thresholds: [],
    }
  ],
  columns: [],
  scroll: true,
  fontSize: '100%',
  sort: { col: 0, desc: true },
};

export class TableCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, templateSrv, annotationsSrv, $sanitize, variableSrv) {
    super($scope, $injector);

    this.pageIndex = 0;

    if (this.panel.styles === void 0) {
      this.panel.styles = this.panel.columns;
      this.panel.columns = this.panel.fields;
      delete this.panel.columns;
      delete this.panel.fields;
    }

    _.defaults(this.panel, panelDefaults);

    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('init-panel-actions', this.onInitPanelActions.bind(this));

    $(document).off('click', 'tr.tr-affect#master-data-material-tr')
    $(document).on('click', 'tr.tr-affect#master-data-material-tr', function (e) {
      const rowData = $('td', this).map((index, td)=>{
        if (td.childNodes.length === 2) {
          return td.childNodes[1].nodeValue
        }else if (td.childNodes.length === 1) {
          return $(td).text()
        }else {
          return ''
        }
      })

      const idIndex = $scope.ctrl.colDimensions.indexOf("id")
      if (!~idIndex) {
        utils.alert('error', 'Error', 'Get not get this material from the database, please contact the dev team')
        return
      }else {
        $scope.ctrl.currentMaterial = utils.findMaterialById($scope.ctrl.materials, rowData[idIndex])[0]
        materialOption.showOptionModal($scope.ctrl)
      }
    })
  }

  onInitEditMode() {
    this.addEditorTab('Options', tablePanelEditor, 2);
    this.addEditorTab('Column Styles', columnOptionsTab, 3);
  }

  onInitPanelActions(actions) {
    actions.push({ text: 'Export CSV', click: 'ctrl.exportCsv()' });
  }

  issueQueries(datasource) {
    this.pageIndex = 0;

    if (this.panel.transform === 'annotations') {
      this.setTimeQueryStart();
      return this.annotationsSrv
        .getAnnotations({
          dashboard: this.dashboard,
          panel: this.panel,
          range: this.range,
        })
        .then(annotations => {
          return { data: annotations };
        });
    }

    return super.issueQueries(datasource);
  }

  onDataError(err) {
    this.dataRaw = [];
    this.render();
  }

  onDataReceived(dataList) {

    if (dataList.length === 0 || dataList === null || dataList === undefined) {
      return
    }

    if (dataList[0].type !== 'table') {
      utils.alert('error', 'Error', 'To show the product list, please format data as a TABLE in the Metrics Setting')
      return
    }

    dataList = this.sortList(dataList)
    this.materials = utils.getRestructuredData(dataList[0].columns, dataList[0].rows)
    this.materialDimensions = dataList[0].columns.map(col => col.text)
    this.materialIds = this.materials.map(material => material.id)

    this.dataRaw = dataList;
    this.wholeData = utils.copy(this.dataRaw)

    this.pageIndex = 0;
    // automatically correct transform mode based on data
    if (this.dataRaw && this.dataRaw.length) {
      if (this.dataRaw[0].type === 'table') {
        this.panel.transform = 'table';
      } else {
        if (this.dataRaw[0].type === 'docs') {
          this.panel.transform = 'json';
        } else {
          if (this.panel.transform === 'table' || this.panel.transform === 'json') {
            this.panel.transform = 'timeseries_to_rows';
          }
        }
      }
    }

    // check filter keywords
    this.checkFilterKeyWord()
    // this.render();
  }

  checkFilterKeyWord(){
    const key = this.filterKeyword
    this.dataRaw = utils.copy(this.wholeData)
    if (key) {
      // search
      const idIndex = utils.findIndexByKeyOnDimension(this.materialDimensions, 'id')
      const descIndex = utils.findIndexByKeyOnDimension(this.materialDimensions, 'description')
      const filteredRows = this.dataRaw[0].rows.filter(row => {
        if (row[idIndex].toLowerCase().includes(key.toLowerCase()) || row[descIndex].toLowerCase().includes(key.toLowerCase())) {
          return row
        }
      })
      this.dataRaw[0].rows = filteredRows
    }
    this.render()
  }

  onAddButtonClick(){
    form.showMaterialForm(this)
  }

  sortList(dataList){
    if (dataList[0].rows.length === 0) {
      return dataList
    }

    dataList[0].rows = dataList[0].rows.sort((a,b) => a[0].localeCompare(b[0]))
    return dataList
  }

  render() {
    this.table = transformDataToTable(this.dataRaw, this.panel);
    // this.table.sort(this.panel.sort);
    this.renderer = new TableRenderer(
      this.panel,
      this.table,
      this.dashboard.isTimezoneUtc(),
      this.$sanitize,
      this.templateSrv,
      this.col
    );

    return super.render(this.table);
  }

  toggleColumnSort(col, colIndex) {
    // remove sort flag from current column
    if (this.table.columns[this.panel.sort.col]) {
      this.table.columns[this.panel.sort.col].sort = false;
    }

    if (this.panel.sort.col === colIndex) {
      if (this.panel.sort.desc) {
        this.panel.sort.desc = false;
      } else {
        this.panel.sort.col = null;
      }
    } else {
      this.panel.sort.col = colIndex;
      this.panel.sort.desc = true;
    }
    this.render();
  }

  exportCsv() {
    const scope = this.$scope.$new(true);
    scope.tableData = this.renderer.render_values();
    scope.panel = 'table';
    this.publishAppEvent('show-modal', {
      templateHtml: '<export-data-modal panel="panel" data="tableData"></export-data-modal>',
      scope,
      modalClass: 'modal--narrow',
    });
  }

  link(scope, elem, attrs, ctrl) {
    let data;
    const panel = ctrl.panel;
    let pageCount = 0;

    function getTableHeight() {
      let panelHeight = ctrl.height;

      if (pageCount > 1) {
        panelHeight -= 26;
      }

      return panelHeight - 31 + 'px';
    }

    function appendTableRows(tbodyElem) {
      ctrl.renderer.setTable(data);
      tbodyElem.empty();
      tbodyElem.html(ctrl.renderer.render(ctrl.pageIndex));
    }

    function switchPage(e) {
      const el = $(e.currentTarget);
      ctrl.pageIndex = parseInt(el.text(), 10) - 1;
      renderPanel();
    }

    function appendPaginationControls(footerElem) {
      footerElem.empty();

      const pageSize = panel.pageSize || 100;
      pageCount = Math.ceil(data.rows.length / pageSize);
      if (pageCount === 1) {
        return;
      }

      const startPage = Math.max(ctrl.pageIndex - 3, 0);
      const endPage = Math.min(pageCount, startPage + 9);

      const paginationList = $('<ul></ul>');

      for (let i = startPage; i < endPage; i++) {
        const activeClass = i === ctrl.pageIndex ? 'active' : '';
        const pageLinkElem = $(
          '<li><a class="table-panel-page-link pointer ' + activeClass + '">' + (i + 1) + '</a></li>'
        );
        paginationList.append(pageLinkElem);
      }

      footerElem.append(paginationList);
    }

    function renderPanel() {
      const panelElem = elem.parents('.panel-content');
      const rootElem = elem.find('.table-panel-scroll');
      const tbodyElem = elem.find('tbody');
      const footerElem = elem.find('.table-panel-footer');

      elem.css({ 'font-size': panel.fontSize });
      panelElem.addClass('table-panel-content');

      appendTableRows(tbodyElem);
      appendPaginationControls(footerElem);
      const height = parseInt(getTableHeight().split('px')[0]) - 38 + 'px'
      rootElem.css({ 'max-height': panel.scroll ? height : '' });

      // get current table column dimensions 
      if (ctrl.table.columns) {
        ctrl.colDimensions = ctrl.table.columns.filter(x => !x.hidden).map(x => x.text)
      }
    }

    // hook up link tooltips
    elem.tooltip({
      selector: '[data-link-tooltip]',
    });

    function addFilterClicked(e) {
      const filterData = $(e.currentTarget).data();
      const options = {
        datasource: panel.datasource,
        key: data.columns[filterData.column].text,
        value: data.rows[filterData.row][filterData.column],
        operator: filterData.operator,
      };

      ctrl.variableSrv.setAdhocFilter(options);
    }

    elem.on('click', '.table-panel-page-link', switchPage);
    elem.on('click', '.table-panel-filter-link', addFilterClicked);

    const unbindDestroy = scope.$on('$destroy', () => {
      elem.off('click', '.table-panel-page-link');
      elem.off('click', '.table-panel-filter-link');
      unbindDestroy();
    });

    ctrl.events.on('render', renderData => {
      data = renderData || data;
      if (data) {
        renderPanel();
      }
      ctrl.renderingCompleted();
    });
  }

}

TableCtrl.templateUrl = './partials/module.html';
