(function () {
  var state = {}; // category -> { problems: [...], index: 0 }

  fetch("data/problems.json", { cache: "no-store" })
    .then(function (res) { return res.json(); })
    .then(setupViewers)
    .catch(function (err) {
      console.error("Failed to load problems.json", err);
    });

  function setupViewers(problems) {
    var byCategory = {};
    problems.forEach(function (p) {
      if (!byCategory[p.category]) byCategory[p.category] = [];
      byCategory[p.category].push(p);
    });

    Object.keys(byCategory).forEach(function (category) {
      var viewer = document.querySelector('.problem-viewer[data-category="' + cssEscape(category) + '"]');
      var countEl = document.querySelector('.category-count[data-count-for="' + cssEscape(category) + '"]');
      if (countEl) countEl.textContent = "(" + byCategory[category].length + ")";
      if (!viewer) return;

      state[category] = { problems: byCategory[category], index: 0 };
      buildViewerChrome(viewer, category);
      renderCurrent(category);
    });
  }

  function cssEscape(str) {
    return str.replace(/"/g, '\\"');
  }

  function buildViewerChrome(viewer, category) {
    var nav = document.createElement("div");
    nav.className = "viewer-nav";

    var prevBtn = document.createElement("button");
    prevBtn.className = "btn-nav btn-prev";
    prevBtn.textContent = "← Back";
    prevBtn.addEventListener("click", function () {
      var s = state[category];
      if (s.index > 0) {
        s.index--;
        renderCurrent(category);
      }
    });

    var counter = document.createElement("span");
    counter.className = "viewer-counter";

    var nextBtn = document.createElement("button");
    nextBtn.className = "btn-nav btn-next";
    nextBtn.textContent = "Next →";
    nextBtn.addEventListener("click", function () {
      var s = state[category];
      if (s.index < s.problems.length - 1) {
        s.index++;
        renderCurrent(category);
      }
    });

    nav.appendChild(prevBtn);
    nav.appendChild(counter);
    nav.appendChild(nextBtn);
    viewer.appendChild(nav);

    var slot = document.createElement("div");
    slot.className = "viewer-card-slot";
    viewer.appendChild(slot);

    viewer._prevBtn = prevBtn;
    viewer._nextBtn = nextBtn;
    viewer._counter = counter;
    viewer._slot = slot;
  }

  function renderCurrent(category) {
    var viewer = document.querySelector('.problem-viewer[data-category="' + cssEscape(category) + '"]');
    var s = state[category];
    var problem = s.problems[s.index];

    if (viewer._calculatorInstance) {
      try { viewer._calculatorInstance.destroy(); } catch (e) {}
      viewer._calculatorInstance = null;
    }
    if (viewer._attemptCalculatorInstance) {
      try { viewer._attemptCalculatorInstance.destroy(); } catch (e) {}
      viewer._attemptCalculatorInstance = null;
    }

    viewer._counter.textContent = (s.index + 1) + " / " + s.problems.length;
    viewer._prevBtn.disabled = s.index === 0;
    viewer._nextBtn.disabled = s.index === s.problems.length - 1;

    viewer._slot.innerHTML = "";
    viewer._slot.appendChild(buildCard(problem, viewer));
  }

  function buildCard(problem, viewer) {
    var card = document.createElement("div");
    card.className = "problem-card";
    card.dataset.problemId = problem.id;

    var header = document.createElement("div");
    header.className = "problem-card-header";

    var left = document.createElement("div");
    var meta = document.createElement("div");
    meta.className = "problem-meta";

    var tag = document.createElement("span");
    tag.className = "subcategory-tag";
    tag.textContent = problem.subcategory;
    meta.appendChild(tag);

    left.appendChild(meta);

    var question = document.createElement("p");
    question.className = "problem-question";
    question.textContent = problem.question;
    left.appendChild(question);

    if (problem.choices && problem.choices.length) {
      var choicesList = document.createElement("ul");
      choicesList.className = "problem-choices";
      problem.choices.forEach(function (choice) {
        var li = document.createElement("li");
        li.textContent = choice;
        choicesList.appendChild(li);
      });
      left.appendChild(choicesList);
    }

    var stopwatch = document.createElement("span");
    stopwatch.className = "stopwatch";
    stopwatch.textContent = "0:00";

    header.appendChild(left);
    header.appendChild(stopwatch);
    card.appendChild(header);

    var attemptLabel = document.createElement("p");
    attemptLabel.className = "attempt-label";
    attemptLabel.textContent = "Try it yourself in Desmos:";
    card.appendChild(attemptLabel);

    var attemptContainer = document.createElement("div");
    attemptContainer.className = "desmos-embed small attempt";
    card.appendChild(attemptContainer);

    if (typeof Desmos !== "undefined") {
      viewer._attemptCalculatorInstance = Desmos.GraphingCalculator(attemptContainer, {
        expressions: true,
        keypad: true,
        settingsMenu: false,
        zoomButtons: true,
        border: false,
      });
    }

    var checkRow = document.createElement("div");
    checkRow.className = "problem-check-row";

    var input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Your answer";
    input.setAttribute("aria-label", "Your answer for: " + problem.question);

    var checkBtn = document.createElement("button");
    checkBtn.className = "btn-check";
    checkBtn.textContent = "Check";

    var feedback = document.createElement("span");
    feedback.className = "feedback";

    checkRow.appendChild(input);
    checkRow.appendChild(checkBtn);
    checkRow.appendChild(feedback);
    card.appendChild(checkRow);

    var toggleBtn = document.createElement("button");
    toggleBtn.className = "btn-toggle-steps";
    toggleBtn.textContent = "Show steps ▾";
    card.appendChild(toggleBtn);

    var stepsPanel = document.createElement("div");
    stepsPanel.className = "problem-steps";

    var answerReveal = document.createElement("p");
    answerReveal.className = "problem-answer-reveal";
    answerReveal.textContent = "Answer: " + problem.answer;
    stepsPanel.appendChild(answerReveal);

    var ol = document.createElement("ol");
    problem.steps.forEach(function (step) {
      var li = document.createElement("li");
      var text = document.createElement("div");
      text.textContent = step.text;
      li.appendChild(text);
      ol.appendChild(li);
    });
    stepsPanel.appendChild(ol);

    var calcContainer = document.createElement("div");
    calcContainer.className = "desmos-embed small";
    stepsPanel.appendChild(calcContainer);

    card.appendChild(stepsPanel);

    var seconds = 0;
    var timerId = setInterval(function () {
      seconds++;
      var m = Math.floor(seconds / 60);
      var sec = seconds % 60;
      stopwatch.textContent = m + ":" + (sec < 10 ? "0" : "") + sec;
    }, 1000);

    function freezeStopwatch() {
      clearInterval(timerId);
      stopwatch.classList.add("frozen");
    }

    checkBtn.addEventListener("click", function () {
      var userAnswer = input.value.trim();
      var isCorrect = checkAnswer(userAnswer, problem);
      feedback.textContent = isCorrect ? "Correct!" : "Not quite — check the steps below.";
      feedback.className = "feedback " + (isCorrect ? "correct" : "incorrect");
      freezeStopwatch();
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") checkBtn.click();
    });

    toggleBtn.addEventListener("click", function () {
      var isOpen = stepsPanel.classList.toggle("open");
      toggleBtn.textContent = isOpen ? "Hide steps ▴" : "Show steps ▾";
      if (isOpen && !viewer._calculatorInstance && typeof Desmos !== "undefined") {
        viewer._calculatorInstance = Desmos.GraphingCalculator(calcContainer, {
          expressions: true,
          keypad: false,
          settingsMenu: false,
          zoomButtons: true,
          border: false,
        });
        (problem.desmosExpressions || []).forEach(function (expr, i) {
          if (expr && typeof expr === "object" && expr.table) {
            viewer._calculatorInstance.setExpression({
              id: "e" + i,
              type: "table",
              columns: [
                { latex: "x_1", values: expr.table.x },
                { latex: "y_1", values: expr.table.y },
              ],
            });
          } else {
            viewer._calculatorInstance.setExpression({ id: "e" + i, latex: expr });
          }
        });
        if (problem.bounds) {
          viewer._calculatorInstance.setMathBounds(problem.bounds);
        }
      }
    });

    return card;
  }

  function checkAnswer(userAnswer, problem) {
    if (!userAnswer) return false;
    if (problem.answerType === "numeric") {
      var userNum = parseFloat(userAnswer);
      var correctNum = parseFloat(problem.answer);
      if (isNaN(userNum) || isNaN(correctNum)) return false;
      return Math.abs(userNum - correctNum) < 0.01;
    }
    return userAnswer.toLowerCase().replace(/\s+/g, "") ===
      String(problem.answer).toLowerCase().replace(/\s+/g, "");
  }
})();
