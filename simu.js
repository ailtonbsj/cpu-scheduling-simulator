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

let v = new Vue({
    el: '#app',
    data: {
        dataset,
        processes: [],
        diagram: [],
        clock: 0,
        queueProcesses: [],
        currentProcess: null
    },
    methods: {
        setProcesses() {
            this.processes = []
            this.diagram = []
            this.clock = 0
            this.queueProcesses = []
            this.currentProcess = null
            let seletedValue = document.getElementById('dataset').value
            if( seletedValue != '') this.processes = dataset[seletedValue]
            this.processes.forEach(proc => {
                this.diagram.push({ id: proc.id, timeline: [] })
            })
        },
        passOneTick() {
            let newProcesses = this.processes.filter(proc => proc.start == this.clock)
            newProcesses.forEach(proc => this.queueProcesses.push(proc))

            this.fcfs()

            if (this.currentProcess) {
                if (this.currentProcess.burst == 0) this.currentProcess = null
                else {
                    let timelines = this.diagram.find(dProc => dProc.id == this.currentProcess.id).timeline
                    let runTimelines = timelines.filter(tl => tl.state == 'run')
                    if (runTimelines.length == 0) {
                        timelines.push({ start: this.clock, end: this.clock + 1, state: 'run' })
                    }
                    else runTimelines[runTimelines.length - 1].end = this.clock + 1
                    this.currentProcess.burst--
                }
            }
            this.queueProcesses.forEach(proc => {
                let timelines = this.diagram.find(dProc => dProc.id == proc.id).timeline
                let readyTimelines = timelines.filter(tl => tl.state == 'ready')
                if (readyTimelines.length == 0)
                    timelines.push({ start: this.clock, end: this.clock + 1, state: 'ready' })
                else readyTimelines[readyTimelines.length - 1].end = this.clock + 1
            })

            this.clock++
        },
        passTenTick() {
            for(let i = 0; i < 10; i++) this.passOneTick()
        },
        fcfs() {
            if (this.queueProcesses.length > 0) {
                if (!this.currentProcess || this.currentProcess.burst == 0) {
                    this.currentProcess = this.queueProcesses.shift()
                }
            }
        }
    }
})