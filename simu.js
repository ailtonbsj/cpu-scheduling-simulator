const dataset = [
    [
        { id: "P1", start: 0, burst: 24 },
        { id: "P2", start: 0, burst: 3 },
        { id: "P3", start: 0, burst: 3 }
    ],
    [
        { id: "P1", start: 0, burst: 10, priority: 3 },
        { id: "P2", start: 0, burst: 1, priority: 1 },
        { id: "P3", start: 0, burst: 2, priority: 4 },
        { id: "P4", start: 0, burst: 1, priority: 5 },
        { id: "P5", start: 0, burst: 5, priority: 2 }
    ],
    [
        { id: "P0", start: 0, burst: 10, priority: 5 },
        { id: "P1", start: 1, burst: 6, priority: 4 },
        { id: "P2", start: 3, burst: 2, priority: 2 },
        { id: "P3", start: 5, burst: 4, priority: 0 }
    ],
    [
        { id: "P1", start: 0, burst: 8 },
        { id: "P2", start: 1, burst: 4 },
        { id: "P3", start: 2, burst: 9 },
        { id: "P4", start: 3, burst: 5 }
    ],
    [
        { id: "P1", start: 0, burst: 6 },
        { id: "P2", start: 0, burst: 8 },
        { id: "P3", start: 0, burst: 7 },
        { id: "P4", start: 0, burst: 3 }
    ],
    [
        { id: "P1", start: 0, burst: 24 },
        { id: "P2", start: 0, burst: 3 },
        { id: "P3", start: 0, burst: 3 }
    ],
    [
        { id: "P2", start: 0, burst: 3 },
        { id: "P3", start: 0, burst: 3 },
        { id: "P1", start: 0, burst: 24 }
    ],
    [
        { id: '1', start: 1, burst: 7, priority: 1, frame: 4 },
        { id: '2', start: 1, burst: 2, priority: 9, frame: 2 },
        { id: '3', start: 4, burst: 20, priority: 4, frame: 5 },
        { id: '4', start: 9, burst: 5, priority: 4, frame: 3 },
        { id: '5', start: 15, burst: 10, priority: 5, frame: 4 },
        { id: '6', start: 16, burst: 19, priority: 2, frame: 2 },
        { id: '7', start: 19, burst: 14, priority: 4, frame: 3 },
        { id: '8', start: 25, burst: 8, priority: 3, frame: 2 },
        { id: '9', start: 30, burst: 20, priority: 8, frame: 3 },
        { id: '10', start: 31, burst: 1, priority: 5, frame: 4 }
    ]
]

let instance = new Vue({
    el: '#app',
    data: {
        dataset,
        datasetIndex: 7,
        schedulingName: 'Round Robin',
        quantum: 5,
        memorySize: 6,
        pageReplacementIndex: 'FIFO',

        processes: [],
        diagram: [],
        clock: 0,
        queueProcesses: [],
        currentProcess: null,
        contQuantum: 0,
        refPages: [],
        memory: [],
        pageErrors: 0,
        pageSuccess: 0,
        logMemory: []
    },
    methods: {
        setProcesses() {
            this.processes = []
            this.diagram = []
            this.clock = 0
            this.queueProcesses = []
            this.currentProcess = null
            this.processes = dataset[this.datasetIndex]
            this.processes.forEach(proc => {
                this.diagram.push({ id: proc.id, timeline: [] })
            })
            this.refPages = []
            this.memory = []
            this.logMemory = []
            this.pageErrors = 0
            this.pageSucces = 0
        },
        setScheduling() {
            switch (this.schedulingName) {
                case 'FCFS':
                    this.scheduling = this.fcfs
                    break
                case 'Round Robin':
                    this.scheduling = this.roundRobin
                    break;
            }
        },
        scheduling() {
            this.roundRobin()
        },
        passOneTick() {
            let newProcesses = this.processes.filter(proc => proc.start == this.clock)
            newProcesses.forEach(proc => this.queueProcesses.push(proc))

            this.scheduling()

            if (this.currentProcess) {
                if (this.currentProcess.burst == 0) this.currentProcess = null
                else {
                    let timelines = this.diagram.find(dProc => dProc.id == this.currentProcess.id).timeline
                    if (timelines.length > 0) {
                        if (timelines[timelines.length - 1].state != 'run') {
                            timelines.push({ start: this.clock, end: this.clock + 1, state: 'run' })
                        } else {
                            let runTimelines = timelines.filter(tl => tl.state == 'run')
                            runTimelines[runTimelines.length - 1].end = this.clock + 1
                        }
                    } else timelines.push({ start: this.clock, end: this.clock + 1, state: 'run' })
                    this.currentProcess.burst--
                }
            }

            this.queueProcesses.forEach(proc => {
                let timelines = this.diagram.find(dProc => dProc.id == proc.id).timeline
                if (timelines.length > 0) {
                    if (timelines[timelines.length - 1].state != 'ready') {
                        timelines.push({ start: this.clock, end: this.clock + 1, state: 'ready' })
                    } else {
                        let runTimelines = timelines.filter(tl => tl.state == 'ready')
                        runTimelines[runTimelines.length - 1].end = this.clock + 1
                    }
                } else {
                    timelines.push({ start: this.clock, end: this.clock + 1, state: 'ready' })
                }
            })

            this.clock++
        },
        passTenTick() {
            for (let i = 0; i < 10; i++) this.passOneTick()
        },
        fcfs() {
            if (this.queueProcesses.length > 0) {
                if (!this.currentProcess || this.currentProcess.burst == 0) {
                    this.currentProcess = this.queueProcesses.shift()
                    console.log(this.refPages)
                    this.addPagesToRef()
                }
            }
        },
        roundRobin() {
            if (this.queueProcesses.length > 0) {
                if (this.currentProcess != null) {
                    if (this.currentProcess.burst == 0) {
                        this.currentProcess = this.queueProcesses.shift()
                        this.contQuantum = 1
                        this.addPagesToRef()
                    } else if (this.contQuantum == this.quantum) {
                        this.queueProcesses.push(this.currentProcess)
                        this.currentProcess = this.queueProcesses.shift()
                        this.contQuantum = 1
                        this.addPagesToRef()
                    } else this.contQuantum++
                } else {
                    this.currentProcess = this.queueProcesses.shift()
                    this.contQuantum = 1
                    this.addPagesToRef()
                }
            }
        },
        addPagesToRef() {
            if (!this.currentProcess.frame) this.currentProcess.frame = 1
            for (let i = 0; i < this.currentProcess.frame; i++)
                this.refPages.push(`${this.currentProcess.id}.${i}`)
        },
        setPageReplacement() {
            switch (this.pageReplacementIndex) {
                case 'FIFO':
                    this.pageReplacement = this.fifo
                    break
                case 'LRU':
                    this.pageReplacement = this.lru
                    break;
                case 'OPT (Ótimo)':
                    this.pageReplacement = this.opt
                    break;
                case 'Segunda Chance':
                    this.pageReplacement = this.secondChance
                    break;
            }
        },
        pageReplacement() {
            this.fifo()
        },
        fifo() {
            this.memory = []
            this.logMemory = []
            this.pageErrors = 0
            this.pageSuccess = 0

            this.refPages.forEach(page => {
                let isOnMemory = this.memory.some(i => i == page)
                if (!isOnMemory) {
                    if (this.memory.length >= this.memorySize) this.memory.shift()
                    this.memory.push(page)
                    this.pageErrors++
                } else this.pageSuccess++

                let contId = isOnMemory ? this.pageSuccess : this.pageErrors
                this.logMemory.push({
                    bg: isOnMemory ? 'successPage' : 'errorPage',
                    dump: `(${contId}) Páginas na memória: ${this.memory.join(' , ')}`
                })
            })
        },
        lru() {
            this.memory = []
            this.logMemory = []
            this.pageErrors = 0
            this.pageSuccess = 0

            this.refPages.forEach((page, index) => {
                let isOnMemory = this.memory.some(i => i == page)
                if (!isOnMemory) {
                    if (this.memory.length >= this.memorySize) {
                        let pass = this.refPages.slice(0, index)
                        let dist = this.memory.map(f => pass.lastIndexOf(f))
                        let adrr = dist.indexOf(-1);
                        if (adrr == -1) adrr = dist.indexOf(Math.min(...dist))
                        this.memory[adrr] = page
                    } else this.memory.push(page)
                    this.pageErrors++
                } else this.pageSuccess++

                let contId = isOnMemory ? this.pageSuccess : this.pageErrors
                this.logMemory.push({
                    bg: isOnMemory ? 'successPage' : 'errorPage',
                    dump: `(${contId}) Páginas na memória: ${this.memory.join(' , ')}`
                })
            })
        },
        opt() {
            this.memory = []
            this.logMemory = []
            this.pageErrors = 0
            this.pageSuccess = 0

            this.refPages.forEach((page, index) => {
                let isOnMemory = this.memory.some(i => i == page)
                if (!isOnMemory) {
                    if (this.memory.length >= this.memorySize) {
                        let dist = this.memory.map(f => this.refPages.slice(index + 1).indexOf(f))
                        let adrr = dist.indexOf(-1)
                        if (adrr == -1) adrr = dist.indexOf(Math.max(...dist))
                        this.memory[adrr] = page
                    } else this.memory.push(page)
                    this.pageErrors++
                } else this.pageSuccess++

                let contId = isOnMemory ? this.pageSuccess : this.pageErrors
                this.logMemory.push({
                    bg: isOnMemory ? 'successPage' : 'errorPage',
                    dump: `(${contId}) Páginas na memória: ${this.memory.join(' , ')}`
                })
            })
        },
        secondChance() {
            this.memory = []
            this.logMemory = []
            this.pageErrors = 0
            this.pageSuccess = 0

            this.refPages.forEach(page => {
                let isOnMemory = this.memory.some(i => i.id == page)
                if (!isOnMemory) {
                    if (this.memory.length >= this.memorySize) {
                        let hasSecondChance = true
                        while (hasSecondChance) {
                            let p = this.memory.shift()
                            if (p.refbit) {
                                p.refbit = 0
                                this.memory.push(p)
                                // Gained second chance!
                                this.logMemory.push({
                                    bg: 'secondChance',
                                    dump: `Segunda Chance: ${this.memory.map(m => m.id).join(' , ')}`
                                })
                            } else hasSecondChance = false
                        }
                    }
                    this.memory.push({ id: page, refbit: 1 })
                    this.pageErrors++
                } else this.pageSuccess++

                let contId = isOnMemory ? this.pageSuccess : this.pageErrors
                this.logMemory.push({
                    bg: isOnMemory ? 'successPage' : 'errorPage',
                    dump: `(${contId}) Páginas na memória: ${this.memory.map(p => p.id).join(' , ')}`
                })
            })
        }
    },
})

instance.setProcesses()
instance.setPageReplacement()