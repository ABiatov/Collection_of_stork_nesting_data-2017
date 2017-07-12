      var map;

      require([
        "esri/map",
        "esri/tasks/GeometryService",

  //      "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/layers/FeatureLayer",

        "esri/Color",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",

        "esri/dijit/editing/Editor",
        "esri/dijit/editing/TemplatePicker",

        "esri/config",
        "dojo/i18n!esri/nls/jsapi",

        "dojo/_base/array", "dojo/parser", "dojo/keys",
        "esri/dijit/BasemapGallery", "esri/arcgis/utils", // BasemapGallery, arcgisUtils необходимы для basemaps
        "esri/dijit/Scalebar", // Scalebar необхадимо для масштабной линеки
        "esri/dijit/Search", // поиск
        "dijit/layout/BorderContainer", "dijit/layout/ContentPane",
        "dojo/domReady!"
      ], function(
        Map, GeometryService,
//        ArcGISTiledMapServiceLayer, 
        FeatureLayer,
        Color, SimpleMarkerSymbol, 
        SimpleLineSymbol,
        Editor, TemplatePicker,
        esriConfig, jsapiBundle,
        arrayUtils, parser, keys, BasemapGallery, arcgisUtils, // BasemapGallery, arcgisUtils необходимы для basemaps
        Scalebar, // Scalebar необхадимо для масштабной линеки
        Search // Поиск
      ) {
        parser.parse();

        // snapping is enabled for this sample - change the tooltip to reflect this
        jsapiBundle.toolbars.draw.start = jsapiBundle.toolbars.draw.start +  "<br>Press <b>ALT</b> to enable snapping";

        // refer to "Using the Proxy Page" for more information:  https://developers.arcgis.com/javascript/3/jshelp/ags_proxy.html
        esriConfig.defaults.io.proxyUrl = "/proxy/";

        //This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications.
        esriConfig.defaults.geometryService = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

        map = new Map("map", {
          basemap: "national-geographic", // list of BaseMaps: https://developers.arcgis.com/javascript/3/jsapi/esri.basemaps-amd.html
          center: [32.00, 49.07],
          zoom: 6,
          slider: false
        });

        map.on("layers-add-result", initEditor);


/* Добавляем Базовую карту*/

        var basemapGallery = new BasemapGallery({
          showArcGISBasemaps: true,
          map: map
        }, "basemapGallery");
        basemapGallery.startup();

        basemapGallery.on("error", function(msg) {
          console.log("basemap gallery error:  ", msg);
        });

/* Добавляем Масштабную линейку */

        var scalebar = new Scalebar({
          map: map,
          // "dual" displays both miles and kilometers
          // "english" is the default, which displays miles
          // use "metric" for kilometers
          scalebarUnit: "metric"  // было значение dual
        });


/* Добавляем векторные слои*/

        var responseNestsReports = new FeatureLayer("https://services.arcgis.com/OmWMtRs230gMd1dq/ArcGIS/rest/services/Nests_of_white_stork_2017/FeatureServer/2", {
          mode: FeatureLayer.MODE_ONDEMAND,
          outFields: ['*'] 
        }); // old name "responsePolys"        

        var responseNestsUnhabited = new FeatureLayer("https://services.arcgis.com/OmWMtRs230gMd1dq/ArcGIS/rest/services/Nests_of_white_stork_2017/FeatureServer/1", {
          mode: FeatureLayer.MODE_ONDEMAND,
          outFields: ['*']
        }); // old name "responsePolys"

        var responseNestsHabited = new FeatureLayer("https://services.arcgis.com/OmWMtRs230gMd1dq/ArcGIS/rest/services/Nests_of_white_stork_2017/FeatureServer/0", {
          mode: FeatureLayer.MODE_ONDEMAND,
          outFields: ['*']
        }); // old name "responsePoints"

        map.addLayers([responseNestsHabited, responseNestsUnhabited, responseNestsReports]);

        function initEditor(evt) {
          var templateLayers = arrayUtils.map(evt.layers, function(result){
            return result.layer;
          });
          var templatePicker = new TemplatePicker({
            featureLayers: templateLayers,
            grouping: true,
            rows: "auto",
            columns: 3
          }, "templateDiv");
          templatePicker.startup();

          var layers = arrayUtils.map(evt.layers, function(result) {
            return { featureLayer: result.layer };
          });
          var settings = {
            map: map,
            templatePicker: templatePicker,
            layerInfos: layers,
            toolbarVisible: true,
     /*       createOptions: {
              polylineDrawTools:[ Editor.CREATE_TOOL_FREEHAND_POLYLINE ],
              polygonDrawTools: [ Editor.CREATE_TOOL_FREEHAND_POLYGON,
                Editor.CREATE_TOOL_CIRCLE,
                Editor.CREATE_TOOL_TRIANGLE,
                Editor.CREATE_TOOL_RECTANGLE
              ]
            }, */
            toolbarOptions: {
              reshapeVisible: false   // изначальное значение "true"
            }
          };

          var params = { settings: settings };
          var myEditor = new Editor(params, 'editorDiv');
          //define snapping options
          var symbol = new SimpleMarkerSymbol(
            SimpleMarkerSymbol.STYLE_CROSS,
            15,
            new SimpleLineSymbol(
              SimpleLineSymbol.STYLE_SOLID,
              new Color([255, 0, 0, 0.5]),
              5
            ),
            null
          );
          map.enableSnapping({
            snapPointSymbol: symbol,
            tolerance: 20,
            snapKey: keys.ALT
          });

          myEditor.startup();
        }

/* Добавляем возможность поиска */
        var search = new Search({
            map: map
         }, "search");
         search.startup();
      });
