class CShapedParabola {
  constructor(endpoint, vertex, numberOfPoints) {
    this.endpoint = endpoint,
      this.vertex = vertex,
      this.numberOfPoints = numberOfPoints
  }

  get coordinates() {
    return this.calculateCoordinates(this.endpoint, this.vertex, this.numberOfPoints);
  }

  calculateCoordinates(endpoint, vertex, numberOfPoints) {
    let coordinates = [];

    let verticalLength = endpoint.y * 2,
      distanceFromOrigin = vertex.x,
      focalLength = this.getFocalLengthFromPointAndDistanceFromOrigin(endpoint, distanceFromOrigin),
      yIncrement = verticalLength / (numberOfPoints - 1);

    for (let i = 0, y = -verticalLength / 2; i < numberOfPoints; i++, y += yIncrement) {
      let x = this.getXFromYAndFocalLength(y, focalLength) + distanceFromOrigin;
      coordinates.push({
        x: x,
        y: y
      });
    }
    return coordinates;
  }

  getFocalLengthFromPointAndDistanceFromOrigin = (point, distanceFromOrigin) => {
    return -Math.pow(point.y, 2) / (4 * (distanceFromOrigin - point.x));
  }

  getXFromYAndFocalLength(y, focalLength) {
    return Math.pow(y, 2) / (4 * focalLength);
  }
}