let g = document.getElementById("grafico");
let out = document.getElementById("processos");

// Exemplo 1
// let processos = [
//     { nome: "P1", chegada: "0", rajada: 24 },
//     { nome: "P2", chegada: "0", rajada: 3 },
//     { nome: "P3", chegada: "0", rajada: 3 }
// ];
// Exemplo 2
// let processos = [
//     { nome: "P2", chegada: "0", rajada: 3 },
//     { nome: "P3", chegada: "1", rajada: 3 },
//     { nome: "P1", chegada: "2", rajada: 24 }
// ];

// Exemplo 3
let processos = [
    { nome: "1", chegada: "1", rajada: 7 },
    { nome: "2", chegada: "1", rajada: 2 },
    { nome: "3", chegada: "4", rajada: 20 },
    { nome: "4", chegada: "9", rajada: 5 },
    { nome: "5", chegada: "15", rajada: 10 },
    { nome: "6", chegada: "16", rajada: 19 },
    { nome: "7", chegada: "19", rajada: 14 },
    { nome: "8", chegada: "25", rajada: 8 },
    { nome: "9", chegada: "30", rajada: 20 },
    { nome: "10", chegada: "31", rajada: 1 }
];

function listProcesses() {
    let tab = `<table>
                <tr>
                <th>Nome</th>
                <th>Chegada</th>
                <th>Espera</th>
                <th>Rajada</th>
                </tr>`;
    for (i in processos) {
        let p = processos[i];
        tab += 
            "<tr>" +
            `<td>${p.nome}</td>
             <td>${p.chegada}</td>
             <td>${p.espera}</td>
             <td>${p.rajada}</td>` +
            "</tr>";
    }
    out.innerHTML = tab;
}

listProcesses(processos);

let clock = 0;
let process = 0;
let suffixId = 0;

function novoBloco(val, name) {
    suffixId++;
    g.innerHTML = g.innerHTML + 
    "<span style='border: 1px solid white;'>"+val +" " + name+" <span id='bk"
    + suffixId + "'></span></span>";
}

function cpu(){
    console.log(clock);

    // Executa Escalonador
    let p = agendador(clock);

    // Desenha grafico
    if(p != process){
        if(!p.tocado) {
            p.tocado = 1;
            p.espera = clock;
        }
        novoBloco(clock, p.nome);
    }
    if(process != 0) document.getElementById("bk"+suffixId).innerHTML = clock;

    // Testa se existe processos a executar
    let semRajadas = true;
    for(i in processos) {
        let p = processos[i];
        if(p.rajada > 0) semRajadas = false;
    }
    if(semRajadas) {
        clearInterval(system);
        listProcesses(processos);
        gerarEstatistica();
    }

    process = p;
    clock++;   
}

let system = setInterval(cpu, 50);

function fcfs(clock){
    let pc = 0;
    for(let i = processos.length-1; i >= 0; i--) {
        let p = processos[i];
        
        if(p.rajada > 0 &&
            clock >= p.chegada ) {
                    pc = p;
        }
    }

    pc.rajada = (pc.rajada)-1;
    console.log(pc);
    return pc;
}

let agendador = fcfs;

function gerarEstatistica() {
    let soma = 0;
    for(i in processos) {
        let p = processos[i];
        soma += p.espera;
    }
    out.innerHTML = out.innerHTML +
    "Tempo médio de espera: " + soma/ processos.length;
}