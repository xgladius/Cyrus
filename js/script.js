document.addEventListener("DOMContentLoaded", function () {
  const classList = document.getElementById("class-list");
  const classNameElement = document.getElementById("class-name");
  const classDetails = document.getElementById("class-details");
  const searchInput = document.getElementById("search");
  const backButton = document.createElement("div");

  backButton.className = "back-button";
  backButton.style.display = "none";
  backButton.onclick = navigateBack;
  classNameElement.parentNode.insertBefore(backButton, classNameElement);

  let classes = {};
  let historyStack = [];

  fetch("classes/classes.json")
    .then((response) => response.json())
    .then((data) => {
      classes = data;
      displayClassList(data);
    });

  function displayClassList(data) {
    classList.innerHTML = "";
    Object.keys(data).forEach((className) => {
      const classItem = document.createElement("div");
      classItem.textContent = className;
      classItem.className = "class-item";
      classItem.onclick = () => displayClassDetails(className);
      classList.appendChild(classItem);
    });
  }

  function createLinkIfClassExists(text) {
    if (classes[text]) {
      return `<a href="#" onclick="navigateToClass('${text}')">${text}</a>`;
    }
    return text;
  }

  function parseType(text) {
    const regex = /<([^>]+)>/;
    const match = text.match(regex);
    if (match) {
      const innerClass = match[1];
      if (classes[innerClass]) {
        return text.replace(innerClass, createLinkIfClassExists(innerClass));
      }
    }
    return createLinkIfClassExists(text);
  }

  function escapeHtml(text) {
    const element = document.createElement("div");
    element.innerText = text;
    return element.innerHTML;
  }

  function displayClassDetails(className) {
    const classData = classes[className];
    let detailsHtml = `<h2>Base Class</h2><p>${parseType(
      escapeHtml(classData.baseClass)
    )}</p>`;

    detailsHtml += "<h2>Properties</h2><table>";
    detailsHtml +=
      "<tr><th>TYPE</th><th>MEMBER</th><th>OFFSET</th><th>NOTE</th></tr>";
    classData.properties.forEach((prop) => {
      detailsHtml += `<tr><td>${parseType(prop.type)}</td><td>${escapeHtml(
        prop.member
      )}</td><td>${escapeHtml(prop.offset)}</td><td>${escapeHtml(
        prop.note
      )}</td></tr>`;
    });
    detailsHtml += "</table>";

    detailsHtml += "<h2>Functions</h2><table>";
    detailsHtml += "<tr><th>TYPE</th><th>MEMBER</th><th>ARGUMENTS</th></tr>";
    classData.functions.forEach((func) => {
      detailsHtml += `<tr><td>${parseType(
        escapeHtml(func.type)
      )}</td><td>${escapeHtml(func.member)}</td><td>${escapeHtml(
        func.arguments
      )}</td></tr>`;
    });
    detailsHtml += "</table>";

    detailsHtml += "<h2>Dependencies</h2><ul>";
    classData.dependencies.forEach((dep) => {
      detailsHtml += `<li>${createLinkIfClassExists(escapeHtml(dep))}</li>`;
    });
    detailsHtml += "</ul>";

    classNameElement.textContent = className;
    classDetails.innerHTML = detailsHtml;

    if (historyStack.length > 0) {
      const previousClass = historyStack[historyStack.length - 1];
      backButton.innerHTML = `<span class="chevron">&larr;</span> ${previousClass}`;
      backButton.style.display = "inline-block";
    } else {
      backButton.style.display = "none";
    }
  }

  function navigateToClass(className) {
    historyStack.push(classNameElement.textContent);
    displayClassDetails(className);
  }

  function navigateBack() {
    if (historyStack.length > 0) {
      const previousClass = historyStack.pop();
      displayClassDetails(previousClass);
    }
  }

  searchInput.addEventListener("input", function () {
    const searchValue = this.value.toLowerCase();
    const filteredClasses = Object.keys(classes).filter((className) =>
      className.toLowerCase().includes(searchValue)
    );
    displayClassList(
      filteredClasses.reduce((acc, className) => {
        acc[className] = classes[className];
        return acc;
      }, {})
    );
  });

  window.displayClassDetails = displayClassDetails;
  window.navigateToClass = navigateToClass;
});
