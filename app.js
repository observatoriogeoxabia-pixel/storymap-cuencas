const track = document.getElementById('track');
const appRoot = document.querySelector('.app');
const slides = Array.from(document.querySelectorAll('.slide'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const status = document.getElementById('status');
const finishBtn = document.getElementById('finishBtn');
const sharedMapShell = document.getElementById('sharedMapShell');
let currentIndex = 0;

const names = ['gorgos', 'barranqueres', 'covatelles', 'plana', 'intercuenca', 'granadella'];
const layers = {};
const contourLayers = {};
const cauceLayers = {};
let activeCauceLayers = [];
let vallXaloLayer = null;
let vallGorgosLayer = null;
let activeHighlight = null;
let activeSlideBaseView = null;
let isSummaryMode = false;
const reliefFocusKeys = new Set([
  'gorgos_source',
  'gorgos_valley',
  'gorgos_to_gata',
  'barranqueres_route',
  'covatelles',
  'plana',
  'intercuenca_focus',
  'granadella_martorell',
  'gorgos_xabia'
]);
const contourFiles = {
  gorgos_source: 'cuencas/curvas_gorgos_source.geojson',
  gorgos_valley: 'cuencas/curvas_gorgos_valley.geojson',
  gorgos_to_gata: 'cuencas/curvas_gorgos_valley.geojson',
  gorgos_xabia: 'cuencas/curvas_gorgos_xabia.geojson',
  barranqueres_route: 'cuencas/curvas_gorgos_xabia.geojson',
  covatelles: 'cuencas/curvas_gorgos_xabia.geojson',
  plana: 'cuencas/curvas_gorgos_xabia.geojson',
  intercuenca: 'cuencas/curvas_gorgos_xabia.geojson',
  intercuenca_focus: 'cuencas/curvas_gorgos_xabia.geojson',
  granadella_martorell: 'cuencas/curvas_gorgos_xabia.geojson'
};
const cauceConfigs = {
  gorgos_source: [
    { file: 'malafit.geojson', name: 'Barranc del Malafí' },
    { file: 'castells.geojson', name: 'Riu Castells' },
    { file: 'xalo.geojson', name: 'Riu Xaló o Gorgos' },
    { file: 'famorca.geojson', name: 'Barranc de Famorca' }
  ],
  gorgos_valley: [
    { file: 'xalo.geojson', name: 'Riu Xaló o Gorgos' }
  ],
  gorgos_to_gata: [
    { file: 'xalo.geojson', name: 'Riu Xaló o Gorgos' }
  ],
  barranqueres_route: [
    { file: 'xalo.geojson', name: 'Riu Xaló o Gorgos' },
    { file: 'barranqueres.geojson', name: 'Barranc de les Barranqueres' },
    { file: 'fonteta.geojson', name: 'Barranc de la Fonteta' },
    { file: 'garroferet.geojson', name: 'Barranc del Garroferet' },
    { file: 'hiedra.geojson', name: "Barranc de l'Hedra" },
    { file: 'migdia.geojson', name: 'Barranc del Migdia' },
    { file: 'runar.geojson', name: 'Barranc de Runar' },
    { file: 'valls.geojson', name: 'Barranc de Les Valls' }
  ],
  covatelles: [
    { file: 'xalo.geojson', name: 'Riu Xaló o Gorgos' },
    { file: 'covatelles.geojson', name: 'Barranc De Covatelles' },
    { file: 'lluca.geojson', name: 'Barranc de Lluca' }
  ],
  plana: [
    { file: 'cap.geojson', nameField: 'nombre' }
  ],
  gorgos_xabia: [
    { file: 'xalo.geojson', name: 'Riu Xaló o Gorgos' },
    { file: 'lucia.geojson', name: 'Barranc de Santa Llúcia' },
    { file: 'fondo.geojson', name: 'Barranc Fondo' }
  ],
  intercuenca: [
    { file: 'xalo.geojson', name: 'Riu Xaló o Gorgos' }
  ],
  granadella: [
    { file: 'orxella.geojson', name: "Barranc de l'Orxella" },
    { file: 'granadella.geojson', name: 'Barranc de La Granadella' },
    { file: 'martorell.geojson', name: 'Barranc de Martorell' }
  ]
};
const focusViews = {
  gorgos_overview: { mode: 'bounds' },
  gorgos_source: {
    mode: 'markerBounds',
    markers: [
      { center: [38.735035, -0.267871], label: 'Facheca' },
      { center: [38.756678, -0.275132], label: 'Tollos' },
      {
        center: [38.752987, -0.167795],
        label: 'Confluencia del Barranc de Famorca - Riu Castells con el Barranc del Malafí',
        description: 'A partir de este punto el Río se denomina Río Xaló o Gorgos.',
        image: 'media/conflu.png'
      }
    ]
  },
  gorgos_valley: {
    mode: 'markerBounds',
    markers: [
      {
        center: [38.755272, -0.110389],
        label: 'Benigembla',
        description: 'A partir de este tramo empieza el Valle de Pop, en esta zona alta del valle predominan los cultivos de Olivos y Almendros.',
        image: 'media/benig.png'
      },
      {
        center: [38.745112, -0.003715],
        description: 'En la parte más baja del valle aparecen las primeras zonas con riesgo de inundación asociadas al río Gorgos. Durante episodios de lluvias intensas, el río puede desbordarse y ocupar parte de la llanura que lo rodea.\n\nEste tramo de riesgo se extiende hasta el entorno de Llíber. A partir de aquí, el Gorgos cambia de comportamiento: el cauce se encaja entre relieves montañosos, atravesando un tramo más estrecho del valle.\n\nTras superar este paso y avanzar hacia Gata de Gorgos, el río vuelve a abrirse y alcanza de nuevo una llanura más amplia, donde reaparecen las zonas naturales de desbordamiento.',
        image: 'media/diap2.png'
      },
      {
        center: [38.738224, -0.046087],
        description: 'En la zona media del Vall de Pop el paisaje agrícola combina cultivos tradicionales de secano, como los almendros y los olivares, con parcelas de cítricos que aprovechan las áreas más fértiles y con mayor disponibilidad de agua.',
        image: 'media/almendros.jpg'
      },
      {
        center: [38.732511, 0.013596],
        description: 'En el tramo más bajo del valle, el paisaje cambia y los viñedos pasan a ser el cultivo predominante, convirtiéndose en el cultivo más característico de esta parte del Vall de Pop.',
        image: 'media/viña.png'
      }
    ]
  },
  gorgos_to_gata: {
    mode: 'markerBounds',
    markers: [
      {
        center: [38.772633, 0.077905],
        description: 'Vista aérea desde Gata de Gorgos donde se observa el curso del río Gorgos atravesando el sistema montañoso y las terrazas fluviales que estructuran el valle.',
        image: 'media/gata.png'
      }
    ]
  },
  barranqueres_route: {
    mode: 'markerBounds',
    markers: [
      {
        center: [38.788673, 0.109141],
        description: 'A medida que los barrancos abandonan las laderas del Montgó, el relieve se vuelve más suave y el paisaje se abre hacia zonas más llanas. En este tramo bajo de la subcuenca se desarrollaron tradicionalmente pequeñas parcelas agrícolas, aprovechando los suelos fértiles formados por los sedimentos que los barrancos han ido depositando a lo largo del tiempo.\n\nDurante décadas estos terrenos estuvieron dedicados principalmente al cultivo de viñedos y frutales, configurando un mosaico agrícola característico del paisaje rural de Xàbia.\n\nSin embargo, en las últimas décadas muchas de estas parcelas han sido abandonadas o transformadas, dando lugar a un paisaje donde conviven algunos campos todavía cultivados con numerosas parcelas cubiertas por vegetación natural. Este proceso refleja los cambios recientes en el uso del suelo y la progresiva transformación del paisaje agrícola tradicional.',
        image: 'media/b2.png'
      },
      {
        center: [38.796213, 0.136315],
        description: 'Las cabeceras de estos barrancos se sitúan en cotas cercanas a los 350–400 metros de altitud, en las laderas del Montgó. Desde estas zonas elevadas, el agua de lluvia desciende rápidamente siguiendo la pendiente del relieve hasta organizarse en pequeños cauces.\n\nLa mayoría de estos barrancos permanecen secos durante gran parte del año, ya que solo transportan agua tras episodios de precipitación. En general, estos barrancos no suponen un riesgo significativo para la población debido a su localización en zonas con fuerte pendiente y escasa ocupación humana. Sin embargo, en algunos puntos la proximidad de urbanizaciones y viviendas que atraviesan o se sitúan cerca de los cauces puede generar situaciones de vulnerabilidad durante episodios de lluvias intensas.',
        image: 'media/b1.png'
      },
      {
        center: [38.777127, 0.144062],
        description: 'Nos encontramos en la parte más baja de la subcuenca de les Barranqueres, una zona que desde el punto de vista geológico corresponde a un fondo de valle y llanura de inundación. En este sector el relieve es prácticamente llano, lo que favorece la acumulación de sedimentos transportados por los barrancos a lo largo del tiempo.\n\nSegún los estudios de peligrosidad, esta zona presenta periodos de inundación relativamente frecuentes, con episodios que pueden alcanzar calados superiores a 0,8 metros aproximadamente cada diez años. La combinación de un relieve muy suave, la concentración de los flujos hacia la salida de la subcuenca y la presencia de vegetación densa de cañar en el cauce contribuyen a que el agua pueda acumularse y provocar inundaciones que se extienden hacia aguas arriba.\n\nEstas condiciones han favorecido también el desarrollo de suelos muy fértiles, lo que explica que históricamente esta zona haya concentrado gran parte de la actividad agrícola de la subcuenca. En la actualidad predominan los cultivos de cítricos y viñedos, que aprovechan las buenas condiciones de los suelos aluviales.\n\nEste paisaje contrasta con el de las zonas situadas aguas arriba, donde muchos de los antiguos campos de cultivo se encuentran hoy abandonados o en proceso de renaturalización, reflejando los cambios recientes en el uso del suelo dentro de la cuenca.',
        image: 'media/barr.png'
      }
    ]
  },
  granadella_martorell: {
    mode: 'markerCenter',
    center: [38.731014, 0.172744],
    zoom: 15.25,
    markers: [
      {
        center: [38.731014, 0.172744],
        description: 'Vista del barranc de Martorell encajado entre los relieves mientras busca su salida natural hacia la Cala de la Granadella.',
        image: 'media/martorell.png'
      },
      {
        center: [38.730095, 0.194963],
        description: 'En este punto confluyen los tres barrancos principales de la cuenca de la Granadella antes de alcanzar la cala. Durante episodios de lluvias intensas, el agua procedente de toda la cuenca se concentra en este tramo del valle.\n\nEn la actualidad existen viviendas residenciales junto al cauce, y en algunos casos los propios barrancos funcionan como accesos a las parcelas durante los periodos secos.',
        image: 'media/grana.png'
      }
    ]
  },
  intercuenca_focus: {
    mode: 'markerBounds',
    bounds: [
      [38.763160, 0.156721],
      [38.766790, 0.228692]
    ],
    markers: [
      {
        center: [38.759412, 0.199362],
        image: 'media/tossalet.png',
        description: 'En la vertiente norte del sistema montañoso situado al sur de Xàbia se localizan numerosos barrancos de pequeño recorrido que históricamente actuaban como ramblas naturales de drenaje. Estos cauces canalizaban el agua de lluvia desde las zonas elevadas hacia la llanura litoral.\n\nSin embargo, con el paso del tiempo muchos de estos barrancos han sufrido una importante transformación del territorio. En algunos tramos sus cauces han sido canalizados de forma subterránea, mientras que en otros casos han sido ocupados por edificaciones o integrados en la red de viales, funcionando actualmente como calles o accesos a parcelas.\n\nEsta ocupación del espacio ha alterado parcialmente el funcionamiento natural del drenaje. Durante episodios de lluvias intensas, el agua tiende a seguir sus antiguos recorridos naturales, lo que puede generar problemas de escorrentía y acumulación de agua en determinados puntos del territorio.\n\nAdemás, la creciente frecuencia de episodios de precipitación intensa en periodos cortos de tiempo, asociados a la dinámica climática mediterránea y a los efectos del cambio climático, incrementa la importancia de comprender cómo funcionan estos antiguos sistemas de drenaje dentro del paisaje urbano actual.'
      },
      {
        center: [38.766356, 0.195077],
        label: 'El Saladar',
        images: ['media/Saladar1.png', 'media/saladar.png'],
        description: 'El Saladar de Xàbia es una amplia depresión situada en la llanura litoral, donde el relieve presenta cotas situadas incluso por debajo del nivel del mar. Esta configuración topográfica favorece que el agua procedente de diferentes barrancos y zonas de escorrentía tienda a concentrarse en este espacio.\n\nNumerosos barrancos que descienden desde los relieves situados al sur del municipio terminan en esta zona, a los que se suman las precipitaciones que se producen directamente sobre la llanura y, en episodios más intensos, los desbordamientos del río Gorgos. Por este motivo, el Saladar actúa como un espacio natural de acumulación de agua dentro del sistema de drenaje de Xàbia.\n\nA diferencia de otros humedales mediterráneos, el Saladar no mantiene una lámina de agua permanente. Sin embargo, su condición de zona deprimida del relieve hace que funcione como un área donde el agua puede concentrarse temporalmente durante episodios de lluvias intensas.\n\nEn la actualidad, este espacio permanece sin urbanizar, aunque constituye una de las áreas del municipio con mayor presión urbanística, debido a su localización dentro de la llanura litoral.'
      },
      {
        center: [38.768591, 0.199216],
        image: 'media/Noria.jpg',
        description: 'La Séquia de la Nòria es un canal excavado en la roca cuya construcción se remonta a época romana. Su función era conducir el agua del mar hacia el Saladar, donde existían salinas destinadas a la producción de sal, vinculadas a la actividad de salazón de pescado.\n\nCon el paso del tiempo se incorporó al sistema una noria, un mecanismo formado por una gran rueda vertical de madera accionada por un animal, que permitía elevar el agua y facilitar su distribución dentro de las zonas de explotación salinera.'
      },
      {
        center: [38.778429, 0.173602],
        label: 'El Pla de Xàbia y sus barrancos',
        image: 'media/lluc.png',
        description: 'Todo el llano de Xàbia está formado principalmente por campos de cultivo, donde predominan los cítricos. Sin embargo, muchos de los caminos existentes en la actualidad coinciden con antiguos barrancos, que durante episodios de lluvia intensa y en situaciones de desbordamiento del río Gorgos canalizan y redistribuyen el agua a través del territorio.\n\nEn la imagen de relieve puede observarse el eje principal, el Barranc de Lluca (actual vial), junto con otros barrancos afluentes. Todos estos cauces conducen el agua principalmente hacia el actual Canal Náutico de la Fontana.'
      },
      {
        center: [38.771916, 0.187473],
        label: 'El Arenal',
        image: 'media/dare.png',
        description: 'El Arenal constituye un espacio altamente antropizado dentro del llano de Xàbia. La urbanización intensiva y la presencia de amplias superficies pavimentadas han generado un elevado grado de impermeabilización del suelo, reduciendo significativamente la capacidad natural de infiltración.\n\nAdemás, algunos puntos de este ámbito se sitúan a cotas muy bajas, próximas e incluso ligeramente inferiores al nivel del mar, lo que incrementa su vulnerabilidad frente a episodios de lluvias intensas y acumulación de agua.\n\nSegún el Sistema Nacional de Cartografía de Zonas Inundables (SNZI), toda esta área está catalogada como zona inundable con un periodo de retorno de 10 años, presentando calados superiores a 0,8 m.'
      },
      {
        center: [38.777178, 0.185411],
        label: 'Canal de la Fontana',
        images: ['media/fontana.png', 'media/fontana1.jfif'],
        imageCredits: {
          'media/fontana1.jfif': 'Fuente: Meteoxabia'
        },
        description: 'El Canal de la Fontana se localiza sobre el espacio ocupado antiguamente por una albufera litoral. En la actualidad funciona como canal náutico, aunque mantiene una importante función hidráulica dentro del sistema de drenaje del llano de Xàbia.\n\nEste canal actúa como vía secundaria de desagüe del Río Gorgos durante episodios de desbordamiento, además de recoger las escorrentías procedentes de los barrancos y del propio llano.\n\nDurante el último gran episodio de desbordamiento del río Gorgos se produjo una riada que llegó a colapsar el canal, alcanzando niveles de agua tales que las embarcaciones llegaron a pasar por debajo del puente entubado y colapsado. Al día siguiente, hasta 52 embarcaciones aparecieron arrastradas por la corriente en la playa del Arenal, evidenciando la magnitud del episodio y la vulnerabilidad hidráulica de este ámbito.'
      }
    ]
  },
  summary_cuencas: { mode: 'allCuencas' },
  gorgos_xabia: {
    mode: 'markerBounds',
    maxZoom: 15.25,
    padding: 24,
    bounds: [
      [38.785839, 0.155241],
      [38.788942, 0.184688]
    ],
    markers: [
      {
        center: [38.794301, 0.181631],
        images: ['media/desem.png', 'media/desem2.png', 'media/desem3.png'],
        description: 'Antiguamente, el Río Gorgos desembocaba en el ámbito de la actual avenida Rei Jaume I. Tras el episodio conocido localmente como l’aiguà del 57, se elaboró un plan para desviar el cauce hacia su trazado actual con el objetivo de reducir el riesgo de inundaciones en el núcleo urbano y mejorar la evacuación de las avenidas hacia el mar.'
      },
      {
        center: [38.783126, 0.168196],
        label: 'Pont del Llavador',
        image: 'media/llava.png',
        description: 'El Pont del Llavador constituye un punto clave para entender las dinámicas del Río Gorgos durante episodios de avenidas. Cuando el río alcanza niveles elevados de caudal, el puente actúa como un punto de estrangulamiento hidráulico que genera un efecto embudo, provocando retenciones de agua aguas arriba y favoreciendo episodios de inundación.\n\nEn estas situaciones, al encontrarse este tramo a una cota inferior respecto a los márgenes del cauce, el agua se desborda por el lado sur y se encauza a través del vial del Barranc de Lluca, siguiendo su antiguo recorrido de desbordamiento natural hasta alcanzar el Canal de la Fontana.'
      }
    ]
  }
};
const cuencaTargetByName = {
  gorgos: 'gorgos_overview',
  barranqueres: 'barranqueres_route',
  covatelles: null,
  plana: null,
  intercuenca: null,
  granadella: 'granadella_martorell'
};
const extraCuencasByScope = {
  barranqueres_route: ['gorgos'],
  covatelles: ['gorgos'],
  gorgos_xabia: ['gorgos'],
  intercuenca: ['gorgos']
};
const cuencaBaseStyle = {
  color: '#ffd400',
  weight: 4.5,
  opacity: 1,
  fillOpacity: 0,
  dashArray: '10 8'
};
const cuencaSummaryHoverStyle = {
  color: '#ffd400',
  weight: 6,
  fillColor: '#ffd400',
  fillOpacity: 0.32,
  dashArray: null
};

const valleyDetailStyle = {
  color: '#d8b11e',
  weight: 2,
  opacity: 0.95,
  fillColor: '#f2cf4a',
  fillOpacity: 0.2
};

const map = L.map('sharedMap', {
  zoomControl: false,
  attributionControl: true,
  zoomSnap: 0.25
}).setView([38.789, 0.166], 12);

map.createPane('reliefPane');
map.createPane('cuencasPane');
map.createPane('detailPane');
map.createPane('contoursPane');
map.createPane('riosPane');
map.createPane('caucesPane');
map.createPane('highlightPane');
map.getPane('reliefPane').style.zIndex = '405';
map.getPane('cuencasPane').style.zIndex = '410';
map.getPane('detailPane').style.zIndex = '412';
map.getPane('contoursPane').style.zIndex = '415';
map.getPane('riosPane').style.zIndex = '420';
map.getPane('caucesPane').style.zIndex = '425';
map.getPane('highlightPane').style.zIndex = '430';

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  attribution: 'Tiles &copy; Esri'
}).addTo(map);

const reliefLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}', {
  pane: 'reliefPane',
  maxZoom: 19,
  opacity: 0.38,
  attribution: 'Hillshade &copy; Esri'
});

const riosPromise = fetch('cuencas/rios.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      pane: 'riosPane',
      style: { color: '#0057d9', weight: 2.4, opacity: 1 }
    }).addTo(map);
  });

const contoursPromise = Promise.all(
  Object.keys(contourFiles).map(focusKey =>
    fetch(contourFiles[focusKey])
      .then(response => {
        if (!response.ok) {
          throw new Error('detalle de curvas no disponible');
        }
        return response.json();
      })
      .then(data => {
        contourLayers[focusKey] = L.geoJSON(data, {
          pane: 'contoursPane',
          style: {
            color: '#5b3a29',
            weight: 1.8,
            opacity: 0.95
          }
        });
      })
      .catch(() => {
        contourLayers[focusKey] = null;
      })
  )
);

const caucesPromise = Promise.all(
  Object.entries(cauceConfigs).flatMap(([scope, configs]) =>
    configs.map(config =>
      fetch(`cauces/${config.file}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`cauce no disponible: ${config.file}`);
          }
          return response.json();
        })
        .then(data => {
          const layer = L.geoJSON(data, {
            pane: 'caucesPane',
            style: {
              color: '#0066ff',
              weight: 8,
              opacity: 0.95
            },
            onEachFeature: (feature, featureLayer) => {
              const dynamicName = config.nameField
                ? feature?.properties?.[config.nameField]
                : null;
              const popupName = dynamicName || config.name;
              if (!popupName) {
                return;
              }
              featureLayer.bindPopup(
                `<div class="map-popup"><strong>${popupName}</strong></div>`,
                {
                  closeButton: false,
                  autoClose: true,
                  closeOnClick: true
                }
              );
            }
          });

          if (!cauceLayers[scope]) {
            cauceLayers[scope] = [];
          }
          cauceLayers[scope].push(layer);
        })
        .catch(() => {
          if (!cauceLayers[scope]) {
            cauceLayers[scope] = [];
          }
        })
    )
  )
);

const vallXaloPromise = fetch('cuencas/vallxalo.geojson')
  .then(response => {
    if (!response.ok) {
      throw new Error('vallxalo no disponible');
    }
    return response.json();
  })
  .then(data => {
    vallXaloLayer = L.geoJSON(data, {
      pane: 'detailPane',
      style: valleyDetailStyle
    });
  })
  .catch(() => {
    vallXaloLayer = null;
  });

const vallGorgosPromise = fetch('cuencas/vallgorgos.geojson')
  .then(response => {
    if (!response.ok) {
      throw new Error('vallgorgos no disponible');
    }
    return response.json();
  })
  .then(data => {
    vallGorgosLayer = L.geoJSON(data, {
      pane: 'detailPane',
      style: valleyDetailStyle
    });
  })
  .catch(() => {
    vallGorgosLayer = null;
  });

const layersPromise = Promise.all(
  names.map(name =>
    fetch(`cuencas/${name}.geojson`)
      .then(response => response.json())
      .then(data => {
        layers[name] = L.geoJSON(data, {
          pane: 'cuencasPane',
          style: cuencaBaseStyle,
          onEachFeature: (_, featureLayer) => {
            featureLayer.on('mouseover', () => {
              if (!isSummaryMode) {
                return;
              }
              featureLayer.setStyle(cuencaSummaryHoverStyle);
            });

            featureLayer.on('mouseout', () => {
              featureLayer.setStyle(cuencaBaseStyle);
            });

            featureLayer.on('click', () => {
              if (isSummaryMode) {
                navigateToCuencaSlide(name);
              }
            });
          }
        });
      })
  )
);

function clearHighlight() {
  if (activeHighlight && map.hasLayer(activeHighlight)) {
    map.removeLayer(activeHighlight);
  }
  activeHighlight = null;
}

function setBaseView(center, zoom) {
  activeSlideBaseView = {
    center: L.latLng(center),
    zoom
  };
}

function setBaseViewFromBounds(bounds, maxZoom, padding) {
  const fitZoom = map.getBoundsZoom(bounds, false, L.point(padding, padding));
  const targetZoom = Math.min(fitZoom, maxZoom);
  setBaseView(bounds.getCenter(), targetZoom);
}

function navigateToCuencaSlide(cuencaName) {
  const targetFocus = cuencaTargetByName[cuencaName];
  const targetIndex = slides.findIndex(slide => {
    if (targetFocus) {
      return slide.dataset.focus === targetFocus;
    }
    return slide.dataset.geojson === cuencaName;
  });

  if (targetIndex < 0) {
    return;
  }

  currentIndex = targetIndex;
  updateSlider();
}

function resetCuencaStyles() {
  names.forEach(layerName => {
    const layer = layers[layerName];
    if (!layer || typeof layer.resetStyle !== 'function') {
      return;
    }
    layer.eachLayer(featureLayer => {
      layer.resetStyle(featureLayer);
    });
  });
}

function addHighlight(view) {
  if (!view) {
    return;
  }

  const markers = view.markers && view.markers.length
    ? view.markers
    : (view.center && view.label ? [{ center: view.center, label: view.label }] : []);

  if (!markers.length) {
    return;
  }

  let popupToOpen = null;

  activeHighlight = L.featureGroup(
    markers.map(marker => {
      const circle = L.circleMarker(marker.center, {
        pane: 'highlightPane',
        className: 'popup-point-marker',
        radius: 9,
        color: '#fff7d6',
        weight: 3,
        fillColor: '#0f5c73',
        fillOpacity: 1
      });

      const markerImages = Array.isArray(marker.images)
        ? marker.images
        : (marker.image ? [marker.image] : []);
      const popupClass = markerImages.length ? 'map-popup has-image' : 'map-popup';
      const popupTitle = marker.label ? `<strong>${marker.label}</strong>` : '';
      const popupDescription = marker.description
        ? marker.description
            .split(/\n\s*\n/)
            .map(paragraph => `<p>${paragraph}</p>`)
            .join('')
        : '';
      const popupImage = markerImages
        .map(imagePath => {
          const credit = marker.imageCredits?.[imagePath];
          const creditHtml = credit ? `<span class="image-credit">${credit}</span>` : '';
          return `<div class="popup-image-wrap"><img src="${imagePath}" alt="${marker.label || 'Imagen del punto'}">${creditHtml}</div>`;
        })
        .join('');

      circle.bindPopup(
        `<div class="${popupClass}">${popupTitle}${popupDescription}${popupImage}</div>`,
        {
          minWidth: markerImages.length ? 420 : 240,
          maxWidth: markerImages.length > 1 ? 620 : (markerImages.length ? 560 : 320),
          closeButton: false,
          autoPan: markerImages.length === 0,
          autoClose: true,
          closeOnClick: true
        }
      );

      let returnView = null;
      circle.on('click', () => {
        returnView = activeSlideBaseView || {
          center: map.getCenter(),
          zoom: map.getZoom()
        };
        const targetZoom = marker.zoom || (markerImages.length ? 15.25 : 15);
        map.flyTo(marker.center, targetZoom, {
          duration: 0.65
        });
      });

      circle.on('popupopen', event => {
        if (!markerImages.length) {
          return;
        }

        const popupEl = event.popup.getElement();
        const mapEl = map.getContainer();
        if (!popupEl || !mapEl) {
          return;
        }

        const popupRect = popupEl.getBoundingClientRect();
        const mapRect = mapEl.getBoundingClientRect();
        const targetX = mapRect.left + mapRect.width / 2;
        const targetY = mapRect.top + mapRect.height / 2;
        const popupX = popupRect.left + popupRect.width / 2;
        const popupY = popupRect.top + popupRect.height / 2;

        map.panBy([popupX - targetX, popupY - targetY], {
          animate: true,
          duration: 0.45
        });
      });

      circle.on('popupclose', () => {
        if (!returnView) {
          return;
        }
        map.flyTo(returnView.center, returnView.zoom, {
          duration: 0.65
        });
        returnView = null;
      });

      if (!popupToOpen && marker.autoOpen) {
        popupToOpen = circle;
      }

      return circle;
    })
  ).addTo(map);

  if (popupToOpen) {
    popupToOpen.openPopup();
  }
}

function showLayer(slide) {
  const name = slide.dataset.geojson;
  resetCuencaStyles();

  names.forEach(layerName => {
    const layer = layers[layerName];
    if (layer && map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });

  Object.keys(contourLayers).forEach(focusKey => {
    const contourLayer = contourLayers[focusKey];
    if (contourLayer && map.hasLayer(contourLayer)) {
      map.removeLayer(contourLayer);
    }
  });

  if (vallXaloLayer && map.hasLayer(vallXaloLayer)) {
    map.removeLayer(vallXaloLayer);
  }
  if (vallGorgosLayer && map.hasLayer(vallGorgosLayer)) {
    map.removeLayer(vallGorgosLayer);
  }

  if (map.hasLayer(reliefLayer)) {
    map.removeLayer(reliefLayer);
  }

  activeCauceLayers.forEach(layer => {
    if (layer && map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
  activeCauceLayers = [];

  clearHighlight();

  const focusKey = slide.dataset.focus;
  const scopeKey = focusKey || name;
  const focusView = focusKey ? focusViews[focusKey] : null;
  isSummaryMode = Boolean(focusView && focusView.mode === 'allCuencas');

  if (isSummaryMode) {
    const summaryLayers = names.map(layerName => layers[layerName]).filter(Boolean);
    summaryLayers.forEach(summaryLayer => summaryLayer.addTo(map));
    const summaryGroup = L.featureGroup(summaryLayers);
    const summaryBounds = summaryGroup.getBounds();
    setBaseViewFromBounds(summaryBounds, 11.25, 120);
    map.flyToBounds(summaryBounds, {
      paddingTopLeft: [110, 220],
      paddingBottomRight: [110, 50],
      maxZoom: 11.25,
      duration: 0.9
    });
    return;
  }

  const layer = layers[name];
  if (!layer) {
    return;
  }

  layer.addTo(map);
  const extraCuencas = extraCuencasByScope[scopeKey] || [];
  extraCuencas.forEach(extraName => {
    const extraLayer = layers[extraName];
    if (extraLayer && extraLayer !== layer) {
      extraLayer.addTo(map);
    }
  });
  const cauceScope = focusKey && cauceLayers[focusKey]?.length ? focusKey : name;

  if (cauceLayers[cauceScope]?.length) {
    cauceLayers[cauceScope].forEach(cauceLayer => {
      cauceLayer.addTo(map);
      activeCauceLayers.push(cauceLayer);
    });
  }

  if (scopeKey && contourLayers[scopeKey]) {
    contourLayers[scopeKey].addTo(map);
  }

  if (scopeKey && reliefFocusKeys.has(scopeKey)) {
    reliefLayer.addTo(map);
  }

  if (focusView && focusView.mode === 'markerBounds') {
    if (focusKey === 'gorgos_valley' && vallXaloLayer) {
      vallXaloLayer.addTo(map);
    }
    if (focusKey === 'gorgos_to_gata' && vallGorgosLayer) {
      vallGorgosLayer.addTo(map);
      addHighlight(focusView);
      setBaseViewFromBounds(vallGorgosLayer.getBounds(), 13.75, 48);
      map.flyToBounds(vallGorgosLayer.getBounds(), {
        paddingTopLeft: [48, 48],
        paddingBottomRight: [48, 48],
        maxZoom: 13.75,
        duration: 0.9
      });
      return;
    }

    addHighlight(focusView);
    const focusBounds = focusView.bounds
      ? L.latLngBounds(focusView.bounds)
      : (activeHighlight ? activeHighlight.getBounds() : null);
    if (focusBounds) {
      const maxZoom = typeof focusView.maxZoom === 'number' ? focusView.maxZoom : 14.25;
      const padding = typeof focusView.padding === 'number' ? focusView.padding : 36;
      setBaseViewFromBounds(focusBounds, maxZoom, padding);
      map.flyToBounds(focusBounds, {
        paddingTopLeft: [padding, padding],
        paddingBottomRight: [padding, padding],
        maxZoom,
        duration: 0.9
      });
    }
    return;
  }

  if (focusKey === 'granadella_martorell') {
    addHighlight(focusView);
    const granadellaBounds = layer.getBounds();
    setBaseViewFromBounds(granadellaBounds, 14.5, 32);
    map.flyToBounds(granadellaBounds, {
      paddingTopLeft: [32, 32],
      paddingBottomRight: [32, 32],
      maxZoom: 14.5,
      duration: 0.9
    });
    return;
  }

  if (focusView && focusView.mode === 'markerCenter' && focusView.center && typeof focusView.zoom === 'number') {
    addHighlight(focusView);
    setBaseView(focusView.center, focusView.zoom);
    map.flyTo(focusView.center, focusView.zoom, {
      duration: 0.9
    });
    return;
  }

  if (focusView && focusView.mode !== 'bounds' && focusView.center && typeof focusView.zoom === 'number') {
    addHighlight(focusView);
    setBaseView(focusView.center, focusView.zoom);
    map.flyTo(focusView.center, focusView.zoom, {
      duration: 0.9
    });
    return;
  }

  const bounds = layer.getBounds();
  const fitZoom = map.getBoundsZoom(bounds, false, L.point(10, 10));
  const targetZoom = Math.min(fitZoom + 0.25, 16);
  setBaseView(bounds.getCenter(), targetZoom);

  map.flyTo(bounds.getCenter(), targetZoom, {
    duration: 0.9
  });
}

function updateSlider() {
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
  const isStartScreen = currentIndex === 0;
  const activeSlide = slides[currentIndex];
  const isSummarySlide = activeSlide.dataset.focus === 'summary_cuencas';
  status.textContent = `${currentIndex + 1} / ${slides.length}`;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === slides.length - 1;
  prevBtn.style.display = (isStartScreen || isSummarySlide) ? 'none' : '';
  status.style.display = (isStartScreen || isSummarySlide) ? 'none' : '';
  nextBtn.style.display = isSummarySlide ? 'none' : '';
  finishBtn.style.display = isSummarySlide ? 'inline-flex' : 'none';
  nextBtn.textContent = isStartScreen ? 'Empezar' : 'Siguiente';
  nextBtn.classList.toggle('cta-pulse', isStartScreen);

  const isMapSlide = activeSlide.dataset.slideType === 'map';
  const panelOnRight = isMapSlide && activeSlide.querySelector('.map-slide')?.classList.contains('panel-right');
  appRoot.classList.toggle('summary-mode', Boolean(isSummarySlide));

  sharedMapShell.classList.toggle('visible', isMapSlide);
  sharedMapShell.classList.toggle('left', Boolean(panelOnRight));
  sharedMapShell.classList.toggle('full', Boolean(isSummarySlide));

  if (isMapSlide) {
    requestAnimationFrame(() => {
      map.invalidateSize();
      showLayer(activeSlide);
    });
  } else {
    clearHighlight();
  }
}

function move(delta) {
  const nextIndex = currentIndex + delta;
  if (nextIndex < 0 || nextIndex >= slides.length) {
    return;
  }
  currentIndex = nextIndex;
  updateSlider();
}

prevBtn.addEventListener('click', () => move(-1));
nextBtn.addEventListener('click', () => move(1));

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    move(-1);
  }

  if (event.key === 'ArrowRight') {
    move(1);
  }
});

Promise.all([riosPromise, contoursPromise, caucesPromise, vallXaloPromise, vallGorgosPromise, layersPromise]).then(() => {
  updateSlider();
});
