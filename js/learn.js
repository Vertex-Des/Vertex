(function () {
  var container = document.getElementById("learn-calculator");
  if (!container || typeof Desmos === "undefined") return;

  var calculator = Desmos.GraphingCalculator(container, {
    expressions: true,
    keypad: true,
    settingsMenu: false,
    border: false,
  });

  calculator.setExpression({ id: "demo1", latex: "y=2x+3" });
  calculator.setExpression({ id: "demo2", latex: "y=-x+9" });
})();
