class BoundingCircle {
  constructor(diameter) {
    this.diameter = diameter;
    this.radius = diameter / 2;
  }

  getXFromY(y) {
    return Math.sqrt(Math.pow(this.radius, 2) - Math.pow(y, 2));
  }
}