
const processes = [
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

let diagram = []
// { start: 0, end: 100, state: 'ready' },
// { start: 100, end: 200, state: 'run' },
// { start: 200, end: 300, state: 'wait' },

processes.forEach(proc => {
    diagram.push({ id: proc.id, timeline: [] })
})

new Vue({
    el: '#app',
    data: {
        diagram: diagram,
        clock: 0,
        queueProcesses: [],
        currentProcess: null
    },
    methods: {
        passOneTick() {
            let newProcesses = processes.filter(proc => proc.start == this.clock)
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
                if(readyTimelines.length == 0)
                    timelines.push({ start: this.clock, end: this.clock + 1, state: 'ready' })
                else readyTimelines[readyTimelines.length - 1].end = this.clock + 1
            })
            
            this.clock++
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