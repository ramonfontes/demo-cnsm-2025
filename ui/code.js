var nodes = [];
var edges = [];
var network = null;
var alertShown = false;
var isConnected = false;
var isInteracting = false;
var EDGE_LENGTH_MAIN = 150;
var prev_state = [];
var curr_state = [];
var packet_size_nodes = [];
var chartInstance = null;
var chartInstanceType = null;

const canvas = document.getElementById("planeCanvas");
const ctx = canvas.getContext("2d");
const img = new Image();
img.src = "plane.png"; // Certifique-se de que a imagem está acessível

const points = [

    { x: 952, y: 175, radius: 5, growing: true }, //1
    { x: 1024, y: 236, radius: 5, growing: true }, //2
    { x: 954, y: 270, radius: 5, growing: true }, //3
    { x: 870, y: 173, radius: 5, growing: true }, //4
    { x: 795, y: 173, radius: 5, growing: true }, //5
    { x: 722, y: 173, radius: 5, growing: true }, //6
    { x: 649, y: 173, radius: 5, growing: true }, //7
    { x: 573, y: 173, radius: 5, growing: true }, //8

    //wings
    { x: 513, y: 102, radius: 5, growing: true }, //9
    { x: 460, y: 52, radius: 5, growing: true }, //10
    { x: 472, y: 116, radius: 5, growing: true }, //11

    { x: 489, y: 173, radius: 5, growing: true }, //12
    { x: 394, y: 173, radius: 5, growing: true }, //13
    { x: 304, y: 173, radius: 5, growing: true }, //14
    { x: 200, y: 173, radius: 5, growing: true }, //15

    { x: 129, y: 90, radius: 5, growing: true }, //16
    { x: 45, y: 8, radius: 5, growing: true }, //17
    { x: 45, y: 88, radius: 5, growing: true }, //18


    { x: 113, y: 173, radius: 5, growing: true }, //19
    { x: 13, y: 173, radius: 5, growing: true }, //20

    { x: 39, y: 231, radius: 5, growing: true }, //21
    { x: 88, y: 220, radius: 5, growing: true }, //22
    { x: 155, y: 248, radius: 5, growing: true }, //23
    { x: 243, y: 265, radius: 5, growing: true }, //24

    { x: 333, y: 273, radius: 5, growing: true },
    { x: 423, y: 273, radius: 5, growing: true },
    { x: 543, y: 262, radius: 5, growing: true },
    { x: 631, y: 271, radius: 5, growing: true },
    { x: 735, y: 273, radius: 5, growing: true },
    { x: 807, y: 273, radius: 5, growing: true },
    { x: 877, y: 273, radius: 5, growing: true },

    //wings
    { x: 560, y: 304, radius: 5, growing: true },
    { x: 500, y: 293, radius: 5, growing: true },
    { x: 450, y: 336, radius: 5, growing: true },

    //engine
    { x: 586, y: 336, radius: 5, growing: true },
    { x: 640, y: 336, radius: 5, growing: true },
];

const points_square = [
    { x: 866, y: 215, size: 25, growing: true },
    { x: 711, y: 215, size: 25, growing: true },
    { x: 567, y: 215, size: 25, growing: true },
    { x: 427, y: 215, size: 25, growing: true },
    { x: 293, y: 215, size: 25, growing: true },
    { x: 157, y: 214, size: 25, growing: true },
];

img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    animate();
};

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    drawPoints();
    requestAnimationFrame(animate);
}

function drawPoints() {
    ctx.fillStyle = "red";
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";

    points.forEach((point, index) => {
        if (nodes.some(node => parseInt(node.label.split('::')[1], 10) === index+1 && (index==0 || index == 1 || index == 2)) || nodes.some(node => parseInt(node.label.split('::')[1], 10) === index+2)) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    });

    points_square.forEach((point, index) => {
        if (nodes.some(node => parseInt(node.label.split('::')[1], 10) === (index+points.length)+2)) {
            ctx.beginPath();
            ctx.fillRect(point.x - point.size / 2, point.y - point.size / 2, point.size, point.size);
            ctx.strokeRect(point.x - point.size / 2, point.y - point.size / 2, point.size, point.size);
        }
    });

    points.forEach((point, index) => {
        if (nodes.some(node => parseInt(node.label.split('::')[1], 10) === index+1 && (index==0 || index == 1 || index == 2)) || nodes.some(node => parseInt(node.label.split('::')[1], 10) === index+2)) {
            if (point.growing) {
                point.radius += 0.2;
                if (point.radius >= 10) point.growing = false;
            } else {
                point.radius -= 0.2;
                if (point.radius <= 5) point.growing = true;
            }
        }
    });

    points_square.forEach((point, index) => {
        if (nodes.some(node => parseInt(node.label.split('::')[1], 10) === (index+points.length)+2)) {
            if (point.growing) {
                point.size += 0.2;
                if (point.size >= 15) point.growing = false;
            } else {
                point.size -= 0.2;
                if (point.size <= 5) point.growing = true;
            }
        }
    });
}


function processPacketSize(packet_size_data) {
    const ctx = document.getElementById("packetChart").getContext("2d");

    // Função para ordenar as chaves
    function sortKeys(key) {
        // Verifica se a chave começa com 'fe80::' e extrai o número após 'fe80::'
        if (key.startsWith('fe80::')) {
            return [1, parseInt(key.split('::')[1])];  // Coloca 'fe80::*' no final
        }
        return [0, key];  // Outras chaves vão primeiro
    }

    // Ordenando as chaves
    const sortedKeys = Object.keys(packet_size_data).sort((a, b) => {
        const [orderA, numA] = sortKeys(a);
        const [orderB, numB] = sortKeys(b);

        // Ordenação primária por 'order' e secundária por número (se for 'fe80::x')
        if (orderA === orderB) {
            return numA - numB;
        }
        return orderA - orderB;
    });

    // Atualiza os dados do gráfico
    const sortedData = sortedKeys.map(key => packet_size_data[key]);

    if (chartInstance !== null) {
        chartInstance.data.labels = sortedKeys;
        chartInstance.data.datasets[0].data = sortedData;
        chartInstance.update();
    } else {
        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: sortedKeys,
                datasets: [{
                    label: "Transmitted Packets",
                    data: sortedData,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function processPacketType(packet_type_data) {
    const ctx = document.getElementById("packetTypeChart").getContext("2d");

    if (chartInstanceType !== null) {
        chartInstanceType.data.labels = Object.keys(packet_type_data);
        chartInstanceType.data.datasets[0].data = Object.values(packet_type_data);
        chartInstanceType.update();
    } else {
        chartInstanceType = new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(packet_type_data),
                datasets: [{
                    label: "Control Messages",
                    data: Object.values(packet_type_data),
                    backgroundColor: "rgba(54, 112, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}


function processData(rank) {

  nodes = [];
  edges = [];

  let idCounter = 1;
  const nodeIds = {};

  for (const [key, values] of Object.entries(rank)) {
    values.forEach((value, index) => {
        const from = value[0];
        const to = value[1];
        if (!(from in nodeIds)) {
            nodeIds[from] = idCounter++;
            label = from;
            nodes.push({
                id: nodeIds[from],
                label: key == label ? "P4-enabled Root\n" + label : label.substring(label.length - 14),
                borderWidth: 3,
                color: key == label ? "orange" : undefined,
            });
        }

        if (!(to in nodeIds)) {
            nodeIds[to] = idCounter++;
            label = to
            nodes.push({
                id: nodeIds[to],
                label: key == label ? "P4-enabled Root\n" + label : label.substring(label.length - 14),
                borderWidth: 3,
                color: key == label ? "orange" : undefined,
            });
        }

        edges.push({ from: nodeIds[from], to: nodeIds[to], color: "black", width: 1, dashes: true, length: EDGE_LENGTH_MAIN });
    });
    }
}

function handleError(error) {
    console.error("An error occurred:", error);
    if (!alertShown) {
        alert("An error occurred:", error);
        alertShown = true;
    }
}

function handleOffline() {
    if (!alertShown) {
        alert("The system is offline");
        alertShown = true;
    }
}

async function draw() {
  const serverIp = '192.168.210.1';
  const serverPort = '5000';
  isConnected = false;
  const url = `http://${serverIp}:${serverPort}/api`;
  const url_packet_size = `http://${serverIp}:${serverPort}/api/packet_size`;
  const url_packet_type = `http://${serverIp}:${serverPort}/api/packet_type`;

  const controller = new AbortController();
  const signal = controller.signal;
  timeout = 1000;

  const fetchTimeout = setTimeout(() => {
    controller.abort();
  }, timeout);

  await fetch(url, { signal })
    .then(response => {
      if (!response.ok) {
        handleError();
      } else {
        clearTimeout(fetchTimeout);
        isConnected = true;
      }
      return response.json();
    })
    .then(data => {
      processData(data);

      if (!network) {
        var container = document.getElementById("mynetwork");
        var data = {
          nodes: nodes,
          edges: edges,
        };
        var options = { layout: { randomSeed: 8 } };
        network = new vis.Network(container, data, options);
      } else {
        network.on("dragStart", function () {
          isInteracting = true;
        });
        network.on("dragEnd", function () {
          isInteracting = false;
        });

        if (!isInteracting) {
          // Atualize os dados e redesenhe a rede sem perder o estado de zoom e posição
          network.setData({
            nodes: nodes,
            edges: edges
          });
          network.redraw(); // Redesenha a rede sem resetar o zoom
        }
      }
    })
    .catch(handleError);

  await fetch(url_packet_size, { signal })
    .then(response => {
      if (!response.ok) {
        handleError();
      }
      return response.json();
    })
    .then(data => {
      processPacketSize(data);
    })
    .catch(handleError);

  await fetch(url_packet_type, { signal })
    .then(response => {
      if (!response.ok) {
        handleError();
      }
      return response.json();
    })
    .then(data => {
      processPacketType(data);
    })
    .catch(handleError);

  if (!isConnected) {
    nodes = null;
    edges = null;
    if (network)
      network.setData({
        nodes: nodes,
        edges: edges,
      });
    isConnected = true;
    alertShown = false;
    handleOffline();
  }
}

window.addEventListener("load", () => {
  draw();
});

setInterval(draw, 1000);