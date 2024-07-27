export type WebSocketEventType =
"subscribe-events" |
"error" |
"success" |

"command:custom:updated" |
"command:custom:created" |
"command:custom:deleted" |

"command:system:created" |
"command:system:updated" |
"command:system:deleted" |

"counter:created" |
"counter:updated" |
"counter:deleted" |

"custom-role:created" |
"custom-role:updated" |
"custom-role:deleted" |

"custom-variable:created" |
"custom-variable:updated" |
"custom-variable:deleted" |

"effect-queue:created" |
"effect-queue:updated" |
"effect-queue:length-updated" |
"effect-queue:deleted" |

"preset-effect-list:created" |
"preset-effect-list:updated" |
"preset-effect-list:deleted" |

"timer:created" |
"timer:updated" |
"timer:deleted";

export interface Message {
    type: string;
    id?: number|string;
    name: WebSocketEventType;
    data?: unknown;
}

export interface InvokeMessage extends Message {
    type: "invoke";
    id: string|number;
    data: unknown[];
}

export interface ResponseMessage extends Message {
    type: "response";
    id: number|string;
    name: "error"|"success";
}

export interface EventMessage extends Message {
    type: "event"
}