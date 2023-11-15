var offsetRLx = "0";
var offsetLRx = "0";
const X_EXPORT_LEFT = -20;
const X_EXPORT_RIGHT = -80;
const X_VIS_LEFT = 100;
const X_VIS_RIGHT = -200;

const cargarArchivoJSON = (url, callback) => {
  //function cargarArchivoJSON(url, callback) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => callback(data))
    .catch((error) => console.error("Error al cargar el archivo JSON", error));
};
const createSVGNode = (
  childNode,
  id,
  inicial,
  fecha,
  lugar,
  numero,
  direction,
  orbita
) => {
  let svg;
  const label = orbita == "" ? "" : "#" + numero;
  const color = direction == "RL" ? "#595a5e" : "#0c3144";
  if (inicial == 1) {
    svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="113" height="95">' +
      '<polygon points="30,10 70,10 90,50 70,90 30,90 10,50" stroke-width="3" stroke="white" fill="' +
      color +
      '"></polygon>' +
      '<foreignObject x="-5" y="35" width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-size:22px; text-align:center;">' +
      "<div>" +
      id +
      "</div>" +
      "</div>" +
      "</foreignObject>" +
      "</svg>";
  } else {
    fecha_lugar =
      "<div><b>" +
      fecha +
      "</b></div><div>" +
      lugar +
      "</div><div>" +
      orbita +
      "</div>";
    svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="183" height="95">' +
      '<polygon  points="50,10 130,10 170,50 130,90 50,90 10,50" stroke-width="4" stroke="white" fill="' +
      color +
      '"></polygon>' +
      '<foreignObject x="2" y="27" width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-size:14px; text-align:center;">' +
      "<div>" +
      fecha_lugar +
      "</div>" +
      "</div>" +
      "</foreignObject>" +
      "</svg>";
  }
  // Rectángulo
  /*var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="110" height="35">' +
    '<rect x="0" y="0" width="100%" height="100%" stroke-width="3" stroke="white" fill="gray"></rect>' +
    '<foreignObject x="4" y="5" width="100%" height="100%">' +
    '<div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-size:10px; text-align:center;">' +
    '<div>' + vehiculo + fecha_lugar + '</div>' +
    '</div>' +
    '</foreignObject>' +
    '</svg>';*/
  // Rombo
  /*var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="110" height="65">' +
      '<polygon points="55,0 100,30 55,60 10,30" stroke-width="3" stroke="white" fill="gray"></polygon>' +
      '<foreignObject x="4" y="5" width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-size:10px; text-align:center;">' +
      '<div>' + vehiculo + fecha_lugar + '</div>' +
      '</div>' +
      '</foreignObject>' +
      '</svg>';*/
  // hexágono regular
  /*const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="110" height="65">' +
      '<polygon points="10,35 40,10 70,10 100,35 70,60 40,60" stroke-width="3" stroke="white" fill="gray"></polygon>' +
      '<foreignObject x="4" y="5" width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-size:14px; text-align:center;">' +
      '<div>' + vehiculo + fecha_lugar + '</div>' +
      '</div>' +
      '</foreignObject>' +
      '</svg>';*/
  // otro hexágono regular
  /*
      const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="143" height="95">' +
      '<polygon points="30,10 70,10 90,50 70,90 30,90 10,50" stroke-width="3" stroke="white" fill="gray"></polygon>' +
      '<foreignObject x="4" y="5" width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-size:14px; text-align:center;">' +
      '<div>' + vehiculo + fecha_lugar + '</div>' +
      '</div>' +
      '</foreignObject>' +
      '</svg>';
      */

  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

  return {
    id: childNode,
    label: label,
    font: {
      size: 10,
      color: "white",
      face: "courier",
      strokeWidth: 0.5,
      strokeColor: "#ffffff",
    },
    image: url,
    shape: "image",
  };
};

const processDirection = (direction, data, nodes, edges) => {
  for (const item of data) {
    const id = item.id;
    //nodes.push(createSVGNode(id, id, "")); // Nodo de primer nivel
    nodes.push(createSVGNode(id, id, 1, null, null, null, direction, "")); // Nodo de primer nivel
    const values = item.datos;
    let lastNodeId = id;
    for (let i = 0; i < values.length; i++) {
      const fecha = values[i].fecha;
      const lugar = values[i].lugar;
      const numero = values[i].numero;
      const orbita = values[i].orbita;
      //const label = `${fecha} ${lugar}`;
      const childNode = `${id}_child_${i}`;
      const inicial = numero ? 1 : 0;
      nodes.push(
        createSVGNode(childNode, id, 2, fecha, lugar, numero, direction, orbita)
      ); // Nodo de segundo nivel
      edges.push({
        from: lastNodeId,
        to: childNode,
        /*label: orbita,
                font: {
                    color: "white",
                    size: 12, // px
                    face: "arial",
                    background: "grey",
                    strokeWidth: 0, // px
                },*/
        arrows: {
          to: { enabled: false, type: "arrow" },
        },
        color: "white",
      });
      lastNodeId = childNode;
    }
  }
};

const alternar_vis = () => {
  const contenedor = document.getElementById("contenedor");
  // alternar anchos/altos según si es vista para browser o para exportar
  const elementos = document.getElementsByClassName("alternar_altura");
  if (contenedor.classList.contains("ancho_vis")) {
    contenedor.classList.remove("ancho_vis");
    contenedor.classList.add("ancho_export");

    for (let i = 0; i < elementos.length; i++) {
      elementos[i].classList.remove("altura_vis");
      elementos[i].classList.add("altura_export");
    }
    inicializar(2); // modo export
  } else {
    contenedor.classList.remove("ancho_export");
    contenedor.classList.add("ancho_vis");
    for (let i = 0; i < elementos.length; i++) {
      elementos[i].classList.add("altura_vis");
      elementos[i].classList.remove("altura_export");
    }
    inicializar(1); // modo visualización página
  }
};

// modo: 1 = browser visualization, 2 = export
const inicializar = (modo) => {
  const nodesLR = [];
  const edgesLR = [];
  const nodesRL = [];
  const edgesRL = [];

  cargarArchivoJSON("data.json", function (jsonData) {
    const x_vis_export_left = modo == 1 ? X_VIS_LEFT : X_EXPORT_LEFT;
    const x_vis_export_right = modo == 1 ? X_VIS_RIGHT : X_EXPORT_RIGHT;
    //const zoomView = modo == 1 ? true : false;
    //const physics = zoomView; // por ahora, igual
    const zoomView = true;
    const physics = true;
    const scale = modo == 1 ? 0.5 : 1.4;
    const navigationButtons = modo == 1 ? true : false;
    const lrData = jsonData["LR"];
    const rlData = jsonData["RL"];

    processDirection("LR", lrData, nodesLR, edgesLR);
    processDirection("RL", rlData, nodesRL, edgesRL);

    const optionsRL = {
      layout: {
        hierarchical: {
          direction: "RL",
          sortMethod: "hubsize",
          levelSeparation: 180,
        },
      },
      physics: physics, // Desactivado en modo export la física para mantener el zoom fijo
      interaction: {
        navigationButtons: navigationButtons,
        zoomView: zoomView, // ¿? Desactivado en modo export el zoom de interacción del usuario
      },
    };
    const optionsLR = {
      layout: {
        hierarchical: {
          direction: "LR",
          sortMethod: "hubsize",
          levelSeparation: 180,
        },
      },
      physics: physics, // Desactivado en modo export la física para mantener el zoom fijo
      interaction: {
        navigationButtons: navigationButtons,
        zoomView: zoomView, // ¿? Desactivado en modo export el zoom de interacción del usuario
      },
    };

    const containerLR = document.getElementById("networkLR");
    const dataLR = {
      nodes: new vis.DataSet(nodesLR),
      edges: new vis.DataSet(edgesLR),
    };

    const containerRL = document.getElementById("networkRL");
    const dataRL = {
      nodes: new vis.DataSet(nodesRL),
      edges: new vis.DataSet(edgesRL),
    };

    const networkLR = new vis.Network(containerLR, dataLR, optionsLR);
    const networkRL = new vis.Network(containerRL, dataRL, optionsRL);
    setTimeout(() => {
      networkLR.moveTo({
        scale: scale,
        position: { x: x_vis_export_right, y: 0 },
        offset: { x: offsetLRx, y: "0" },
      });
      networkRL.moveTo({
        scale: scale,
        position: { x: x_vis_export_left, y: 0 },
        offset: { x: offsetRLx, y: "0" },
      });      
    }, 1000);

  });
};
// e. handlers

// wait for the document to load before initializing the diagram.
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("alternar").addEventListener("click", function () {
    alternar_vis();
  });
  document.getElementById("downloadPNG").addEventListener("click", function () {
    const container = document.getElementById("contenedor");
    //const originalZoom = window.innerWidth / container.offsetWidth;

    // Aumenta temporalmente el tamaño de #contenedor para mejorar la calidad de la captura
    //container.style.width = "3000px"; // Aumenta el ancho
    //container.style.height = "3000px"; // Aumenta el alto

    // Ajusta el zoom del navegador al 100%
    document.body.style.transform = `scale(1)`;

    html2canvas(container, { scale: 2 }).then(function (canvas) {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "infografia.png";
      link.click();

      // Restaura el tamaño original de #contenedor
      container.style.width = "auto";
      container.style.height = "auto";

      // Restaura el zoom del navegador al 100%
      document.body.style.transform = "scale(1)";
    });
  });

  document.getElementById("downloadPDF").addEventListener("click", function () {
    alternar_vis();
    setTimeout(() => {
      window.jsPDF = window.jspdf.jsPDF;
      const target = document.getElementById("contenedor");

      html2canvas(target, { scale: 2 }).then(function (canvas) {
        const imgData = canvas.toDataURL("image/png");

        // Obtener las dimensiones del div
        const divWidth = target.offsetWidth;
        const divHeight = target.offsetHeight;

        // Configurar el tamaño del PDF para que coincida con las dimensiones del div
        const pdf = new jsPDF({
          orientation: divWidth > divHeight ? "landscape" : "portrait",
          unit: "px",
          format: [divWidth, divHeight],
        });

        // Agregar la imagen al PDF
        pdf.addImage(imgData, "PNG", 0, 0, divWidth, divHeight);

        // Guardar el PDF
        pdf.save("pagina.pdf");
      });
      alternar_vis();
    }, 2000);
  });
  inicializar(1);
});
/*document
.getElementById("downloadPNG")
.addEventListener("click", function () {
  html2canvas(document.body, { scale: 2 }).then(function (canvas) {
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = "infografia.png";
    link.click();
  });
});*/
