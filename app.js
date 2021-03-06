// Color Utils
function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function invertColor(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

let colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

// APP

let system, clock, suffixId, processos, agendador, g, out;
let previousProc;
let quantum = 0;
let contQuantum = -1;
let queue = [];

let conjunto = [
    [
        { nome: "P1", chegada: 0, rajada: 24 },
        { nome: "P2", chegada: 0, rajada: 3 },
        { nome: "P3", chegada: 0, rajada: 3 }
    ],
    [
        { nome: "P1", chegada: 0, rajada: 10, prioridade: 3 },
        { nome: "P2", chegada: 0, rajada: 1, prioridade: 1 },
        { nome: "P3", chegada: 0, rajada: 2, prioridade: 4 },
        { nome: "P4", chegada: 0, rajada: 1, prioridade: 5 },
        { nome: "P5", chegada: 0, rajada: 5, prioridade: 2 }
    ],
    [
        { nome: "P0", chegada: 0, rajada: 10, prioridade: 5 },
        { nome: "P1", chegada: 1, rajada: 6, prioridade: 4 },
        { nome: "P2", chegada: 3, rajada: 2, prioridade: 2 },
        { nome: "P3", chegada: 5, rajada: 4, prioridade: 0 }
    ],
    [
        { nome: "P1", chegada: 0, rajada: 8 },
        { nome: "P2", chegada: 1, rajada: 4 },
        { nome: "P3", chegada: 2, rajada: 9 },
        { nome: "P4", chegada: 3, rajada: 5 }
    ],
    [
        { nome: "P1", chegada: 0, rajada: 6 },
        { nome: "P2", chegada: 0, rajada: 8 },
        { nome: "P3", chegada: 0, rajada: 7 },
        { nome: "P4", chegada: 0, rajada: 3 }
    ],
    [
        { nome: "P1", chegada: 0, rajada: 24 },
        { nome: "P2", chegada: 0, rajada: 3 },
        { nome: "P3", chegada: 0, rajada: 3 }
    ],
    [
        { nome: "P2", chegada: 0, rajada: 3 },
        { nome: "P3", chegada: 0, rajada: 3 },
        { nome: "P1", chegada: 0, rajada: 24 }
    ],
    [
        { nome: "1", chegada: 1, rajada: 7, prioridade: 1 },
        { nome: "2", chegada: 1, rajada: 2, prioridade: 9 },
        { nome: "3", chegada: 4, rajada: 20, prioridade: 4 },
        { nome: "4", chegada: 9, rajada: 5, prioridade: 4 },
        { nome: "5", chegada: 15, rajada: 10, prioridade: 5 },
        { nome: "6", chegada: 16, rajada: 19, prioridade: 2 },
        { nome: "7", chegada: 19, rajada: 14, prioridade: 4 },
        { nome: "8", chegada: 25, rajada: 8, prioridade: 3 },
        { nome: "9", chegada: 30, rajada: 20, prioridade: 8 },
        { nome: "10", chegada: 31, rajada: 1, prioridade: 5 }
    ]
];

function listProcesses() {
    let tab = `<table>
                <tr>
                <th>Nome</th>
                <th>Chegada</th>
                <th>Rajada</th>
                <th>Prioridade</th>
                <th>Espera<br>Inicial</th>
                <th>Espera<br>Adicional</th>
                </tr>`;
    for (i in processos) {
        let p = processos[i];
        tab +=
            "<tr>" +
            `<td>${p.nome}</td>
             <td>${p.chegada}</td>
             <td>${p.rajadaImutable}</td>
             <td>${p.prioridade}</td>
             <td>${p.espera}</td>
             <td>${p.esperaAd}</td>` +
            "</tr>";
    }
    out.innerHTML = tab;
}

function novoBloco(val, name, iColor) {
    suffixId++;
    g.innerHTML = g.innerHTML +
        `<span style='background-color: ${colors[iColor]}; color: black;'>
        ${val} <span style='font-weight: bold;'>${name}</span> <span id='bk${suffixId}'></span>
    </span>`;
    iColor++;
}

function cpu() {
    try {
        // quantum
        contQuantum = (contQuantum >= quantum - 1) ? 0 : ++contQuantum;

        // Executa Escalonador
        let p = agendador(clock);

        // Desenha grafico
        if (p != previousProc) {
            if (!p.tocado) {
                p.tocado = 1;
                p.espera = clock - p.chegada;
                p.esperaAd = 0;
            }
            if (previousProc.rajada > 0) previousProc.wait = clock;
            if (p.wait)
                p.esperaAd = p.esperaAd + (clock - p.wait);
            contQuantum = 0;
            novoBloco(clock, p.nome, p.color);
        }
        if (previousProc != 0) document.getElementById("bk" + suffixId).innerHTML = clock;

        // Testa se existe processos a executar
        let semRajadas = true;
        for (i in processos) {
            let p = processos[i];
            if (p.rajada > 0) semRajadas = false;
        }
        if (semRajadas) {
            clearInterval(system);
            listProcesses(processos);
            gerarEstatistica();
        }

        previousProc = p;
        clock++;

    } catch (error) {
        console.error("PAROU>", error.message);
        console.error("LINHA>", error.stack);
        clearInterval(system);
    }
}

function gerarEstatistica() {
    let soma = processos.reduce( (acc, p) => acc +=  (p.espera + p.esperaAd), 0 );
    out.innerHTML = out.innerHTML +
        "Tempo médio de espera: " + soma / processos.length;
}

function getDataSet() {
    let menuDados = document.getElementById("dados");
    let dataSetNum = menuDados.options[menuDados.selectedIndex].value;
    processos = conjunto[dataSetNum];
    for (i in processos) {
        let p = processos[i];
        p.rajadaImutable = p.rajada;
        if (!p.prioridade) p.prioridade = 0;
        p.color = i;
    }
    listProcesses(processos);
}

window.onload = function () {
    let menuDados = document.getElementById("dados");
    let menuAlg = document.getElementById("algoritmo");
    let menuClk = document.getElementById("relogio");
    let iQuant = document.getElementById("iquantum");
    let btnStart = document.getElementById("btnStart");
    g = document.getElementById("grafico");
    out = document.getElementById("processos");

    let itens = "";
    for (let i = 0; i < conjunto.length; i++) itens += `<option value="${i}">Conjunto ${i + 1}</option>`;
    menuDados.innerHTML = itens;
    menuDados.onclick = getDataSet;

    btnStart.onclick = function () {
        btnStart.style.display = 'none';
        let AlgOpt = menuAlg.options[menuAlg.selectedIndex].value;
        let ClockOpt = menuClk.options[menuClk.selectedIndex].value;

        g.innerHTML = "";
        out.innerHTML = "";
        clock = 0;
        previousProc = 0;
        suffixId = 0;

        getDataSet();

        switch (AlgOpt) {
            case "FCFS":
                agendador = fcfs;
                break;
            case "SJF Preemptivo":
                agendador = sjf_prep;
                break;
            case "SJF":
                agendador = sjf;
                break;
            case "Prioridade Preemptivo":
                agendador = prio_prep;
                break;
            case "Prioridade":
                agendador = prio;
                break;
            case "Round Robin":
                agendador = rrobin;
                quantum = parseInt(iQuant.value);
        }

        clearInterval(system);
        system = setInterval(cpu, ClockOpt);
    }
}

function getReadyProcesses(clock, listProcesses) {
    return listProcesses.filter(proc => proc.rajada > 0 && proc.chegada <= clock);
}

function printQueueNames(queue) {
    let nomes = queue.map(proc => proc.nome);
    console.log(nomes.join(","));
}

function fcfs(clock) {
    let pc = 0;
    for (let i = processos.length - 1; i >= 0; i--) {
        let p = processos[i];

        if (p.rajada > 0 &&
            clock >= p.chegada) {
            pc = p;
        }
    }

    pc.rajada = (pc.rajada) - 1;
    return pc;
}

function sjf_prep(clock) {
    let pc = 0;
    for (let i = processos.length - 1; i >= 0; i--) {
        let p = processos[i];

        if (p.rajada > 0 &&
            clock >= p.chegada) {
            if (pc == 0 || pc.rajada >= p.rajada)
                pc = p;
        }
    }

    pc.rajada = (pc.rajada) - 1;
    return pc;
}

function sjf(clock) {
    if (previousProc.rajada > 0) {
        previousProc.rajada = (previousProc.rajada) - 1;
        return previousProc;
    }
    return sjf_prep(clock);
}

function prio_prep(clock) {
    let pc = 0;
    for (let i = processos.length - 1; i >= 0; i--) {
        let p = processos[i];

        if (p.rajada > 0 &&
            clock >= p.chegada) {
            if (pc == 0) {
                pc = p;
            }
            else if (p.prioridade < pc.prioridade) {
                pc = p;
            }
            else if (p.prioridade == pc.prioridade) {
                let pChegadaRel = p.wait ? p.wait : p.chegada;
                let pcChegadaRel = pc.wait ? pc.wait : pc.chegada;
                if (pChegadaRel <= pcChegadaRel) pc = p;
            }
        }
    }

    pc.rajada = (pc.rajada) - 1;
    return pc;
}

function prio(clock) {
    if (previousProc.rajada > 0) {
        previousProc.rajada = (previousProc.rajada) - 1;
        return previousProc;
    }
    return prio_prep(clock);
}

function rrobin(clock) {
    let pc = 0;
    let readyProcesses = getReadyProcesses(clock, processos);

    let startedProcesses = readyProcesses.filter(proc => proc.chegada == clock);
    startedProcesses.forEach(proc => queue.push(proc));
    printQueueNames(queue);
    
    if(previousProc.rajada == 0){
        console.log("EXIT", clock);
        queue = queue.filter(proc => proc != previousProc);
        pc = queue.shift();
    } else {
        if(!contQuantum) {
            console.log("INTERRUPT", clock);
            if (previousProc != 0) queue.push(previousProc);
            if(queue.length > 0) pc = queue.shift();
        } else {
            console.log(clock);
            if(!previousProc) pc = queue.shift();
            else pc = previousProc;
        }
    }

    if(pc != 0) pc.rajada = (pc.rajada) - 1;
    return pc;
}
