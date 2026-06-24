const normalizeDate = (date, isEnd = false) => {
  const d = new Date(date + 'T00:00:00'); // parsed as PKT because of TZ setting
  if (isEnd) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d;
};

module.exports = { normalizeDate };