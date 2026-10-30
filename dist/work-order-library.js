document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('workOrderSearch');
  var count = document.getElementById('workOrderCount');
  var empty = document.getElementById('workOrderEmpty');
  var rows = Array.prototype.slice.call(document.querySelectorAll('[data-work-order]'));

  if (!input || !count || !empty || !rows.length) return;

  function filterWorkOrders() {
    var keyword = input.value.trim().toLocaleLowerCase('zh-CN');
    var visibleCount = 0;

    rows.forEach(function (row) {
      var matches = !keyword || row.textContent.toLocaleLowerCase('zh-CN').indexOf(keyword) !== -1;
      row.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    count.textContent = String(visibleCount);
    empty.hidden = visibleCount !== 0;
  }

  input.addEventListener('input', filterWorkOrders);
});
