class BPMNDiagram {
    constructor() {
        this.processes = [];
    }

    addProcess(process) {
        this.processes.push(process);
    }
}

class BPMNProcess {
    constructor(id, isExecutable) {
        this.id = id;
        this.isExecutable = isExecutable;
        this.startEvent = null;
        this.tasks = [];
        this.sequenceFlows = [];
        this.gateways = [];
    }

    setStartEvent(startEvent) {
        this.startEvent = startEvent;
    }

    addTask(task) {
        this.tasks.push(task);
    }

    addSequenceFlow(sequenceFlow) {
        this.sequenceFlows.push(sequenceFlow);
    }

    addGateway(gateway) {
        this.gateways.push(gateway);
    }
}

class BPMNStartEvent {
    constructor(id) {
        this.id = id;
        this.outgoing = null;
    }

    setOutgoing(outgoing) {
        this.outgoing = outgoing;
    }
}

class BPMNTask {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.incoming = null;
        this.outgoing = null;
    }

    setIncoming(incoming) {
        this.incoming = incoming;
    }

    setOutgoing(outgoing) {
        this.outgoing = outgoing;
    }
}

class BPMNGateway {
    constructor(id, type) {
        this.id = id;
        this.type = type;
        this.incoming = null;
        this.outgoings = [];
    }

    setIncoming(incoming) {
        this.incoming = incoming;
    }

    addOutgoing(outgoing) {
        this.outgoings.push(outgoing);
    }
}

class BPMNSequenceFlow {
    constructor(id, sourceRef, targetRef) {
        this.id = id;
        this.sourceRef = sourceRef;
        this.targetRef = targetRef;
    }
}
