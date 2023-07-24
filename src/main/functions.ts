export function bytesToSize(bytes: number) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 0;
    var i: number= Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat(Math.round(bytes / Math.pow(1024, i)).toString() )} ${sizes[i]}` 
}