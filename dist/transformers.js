'use strict';

System.register(['lodash', 'app/core/utils/flatten', 'app/core/time_series2', 'app/core/table_model'], function (_export, _context) {
  "use strict";

  var _, flatten, TimeSeries, TableModel, mergeTablesIntoModel, transformers;

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  function transformDataToTable(data, panel) {
    var model = new TableModel();

    if (!data || data.length === 0) {
      return model;
    }

    var transformer = transformers[panel.transform];
    if (!transformer) {
      throw { message: 'Transformer ' + panel.transform + ' not found' };
    }

    transformer.transform(data, panel, model);
    return model;
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsFlatten) {
      flatten = _appCoreUtilsFlatten.default;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_appCoreTable_model) {
      TableModel = _appCoreTable_model.default;
      mergeTablesIntoModel = _appCoreTable_model.mergeTablesIntoModel;
    }],
    execute: function () {
      _export('transformers', transformers = {});

      transformers['timeseries_to_rows'] = {
        description: 'Time series to rows',
        getColumns: function getColumns() {
          return [];
        },
        transform: function transform(data, panel, model) {
          model.columns = [{ text: 'Time', type: 'date' }, { text: 'Metric' }, { text: 'Value' }];

          for (var i = 0; i < data.length; i++) {
            var series = data[i];
            for (var y = 0; y < series.datapoints.length; y++) {
              var dp = series.datapoints[y];
              model.rows.push([dp[1], series.target, dp[0]]);
            }
          }
        }
      };

      transformers['timeseries_to_columns'] = {
        description: 'Time series to columns',
        getColumns: function getColumns() {
          return [];
        },
        transform: function transform(data, panel, model) {
          model.columns.push({ text: 'Time', type: 'date' });

          // group by time
          var points = {};

          for (var i = 0; i < data.length; i++) {
            var series = data[i];
            model.columns.push({ text: series.target });

            for (var y = 0; y < series.datapoints.length; y++) {
              var dp = series.datapoints[y];
              var timeKey = dp[1].toString();

              if (!points[timeKey]) {
                points[timeKey] = { time: dp[1] };
                points[timeKey][i] = dp[0];
              } else {
                points[timeKey][i] = dp[0];
              }
            }
          }

          for (var time in points) {
            var point = points[time];
            var values = [point.time];

            for (var _i = 0; _i < data.length; _i++) {
              var value = point[_i];
              values.push(value);
            }

            model.rows.push(values);
          }
        }
      };

      transformers['timeseries_aggregations'] = {
        description: 'Time series aggregations',
        getColumns: function getColumns() {
          return [{ text: 'Avg', value: 'avg' }, { text: 'Min', value: 'min' }, { text: 'Max', value: 'max' }, { text: 'Total', value: 'total' }, { text: 'Current', value: 'current' }, { text: 'Count', value: 'count' }];
        },
        transform: function transform(data, panel, model) {
          var i = void 0,
              y = void 0;
          model.columns.push({ text: 'Metric' });

          for (i = 0; i < panel.columns.length; i++) {
            model.columns.push({ text: panel.columns[i].text });
          }

          for (i = 0; i < data.length; i++) {
            var series = new TimeSeries({
              datapoints: data[i].datapoints,
              alias: data[i].target
            });

            series.getFlotPairs('connected');
            var cells = [series.alias];

            for (y = 0; y < panel.columns.length; y++) {
              cells.push(series.stats[panel.columns[y].value]);
            }

            model.rows.push(cells);
          }
        }
      };

      transformers['annotations'] = {
        description: 'Annotations',
        getColumns: function getColumns() {
          return [];
        },
        transform: function transform(data, panel, model) {
          model.columns.push({ text: 'Time', type: 'date' });
          model.columns.push({ text: 'Title' });
          model.columns.push({ text: 'Text' });
          model.columns.push({ text: 'Tags' });

          if (!data || !data.annotations || data.annotations.length === 0) {
            return;
          }

          for (var i = 0; i < data.annotations.length; i++) {
            var evt = data.annotations[i];
            model.rows.push([evt.time, evt.title, evt.text, evt.tags]);
          }
        }
      };

      transformers['table'] = {
        description: 'Table',
        getColumns: function getColumns(data) {
          if (!data || data.length === 0) {
            return [];
          }
          // Single query returns data columns as is
          if (data.length === 1) {
            return [].concat(_toConsumableArray(data[0].columns));
          }

          // Track column indexes: name -> index
          var columnNames = {};

          // Union of all columns
          var columns = data.reduce(function (acc, series) {
            series.columns.forEach(function (col) {
              var text = col.text;

              if (columnNames[text] === undefined) {
                columnNames[text] = acc.length;
                acc.push(col);
              }
            });
            return acc;
          }, []);

          return columns;
        },
        transform: function transform(data, panel, model) {
          if (!data || data.length === 0) {
            return;
          }

          var noTableIndex = _.findIndex(data, function (d) {
            return d.type !== 'table';
          });
          if (noTableIndex > -1) {
            throw {
              message: 'Result of query #' + String.fromCharCode(65 + noTableIndex) + ' is not in table format, try using another transform.'
            };
          }

          // mergeTablesIntoModel(model, ...data);

          model.columns = data[0].columns;
          model.rows = data[0].rows;
        }
      };

      transformers['json'] = {
        description: 'JSON Data',
        getColumns: function getColumns(data) {
          if (!data || data.length === 0) {
            return [];
          }

          var names = {};
          for (var i = 0; i < data.length; i++) {
            var series = data[i];
            if (series.type !== 'docs') {
              continue;
            }

            // only look at 100 docs
            var maxDocs = Math.min(series.datapoints.length, 100);
            for (var y = 0; y < maxDocs; y++) {
              var doc = series.datapoints[y];
              var flattened = flatten(doc, null);
              for (var propName in flattened) {
                names[propName] = true;
              }
            }
          }

          return _.map(names, function (value, key) {
            return { text: key, value: key };
          });
        },
        transform: function transform(data, panel, model) {
          var i = void 0,
              y = void 0,
              z = void 0;

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = panel.columns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var column = _step.value;

              var tableCol = { text: column.text };

              // if filterable data then set columns to filterable
              if (data.length > 0 && data[0].filterable) {
                tableCol.filterable = true;
              }

              model.columns.push(tableCol);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          if (model.columns.length === 0) {
            model.columns.push({ text: 'JSON' });
          }

          for (i = 0; i < data.length; i++) {
            var series = data[i];

            for (y = 0; y < series.datapoints.length; y++) {
              var dp = series.datapoints[y];
              var values = [];

              if (_.isObject(dp) && panel.columns.length > 0) {
                var flattened = flatten(dp, null);
                for (z = 0; z < panel.columns.length; z++) {
                  values.push(flattened[panel.columns[z].value]);
                }
              } else {
                values.push(JSON.stringify(dp));
              }

              model.rows.push(values);
            }
          }
        }
      };
      _export('transformers', transformers);

      _export('transformDataToTable', transformDataToTable);
    }
  };
});
//# sourceMappingURL=transformers.js.map
