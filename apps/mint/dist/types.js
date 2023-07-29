"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "status", {
    enumerable: true,
    get: function() {
        return status;
    }
});
var status;
(function(status) {
    status[status['pending'] = 0] = 'pending';
    status[status['completed'] = 1] = 'completed';
    status[status['failed'] = 2] = 'failed';
})(status || (status = {}));
