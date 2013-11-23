module.exports = Progress;

function Progress() {
    if (!(this instanceof Progress)) return new Progress();
    
    this.el = document.createElement('div');
    this.el.className = 'progress';
    
    this.bar = document.createElement('div');
    this.bar.className = 'bar';
    
    this.el.appendChild(this.bar);
}

Progress.prototype.set = function (per) {
    per = per > 100 ? 100 : per < 0 ? 0 : per;
    this.percent = per;
    this.bar.style.width = per + "%";
};