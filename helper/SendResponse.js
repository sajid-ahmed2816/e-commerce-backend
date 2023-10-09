const sendResponse = (status, data, message) => {
  const response = {
    status: status,
    data: data,
    message: message,
  };

  if (status === 200) {
    response.message = message || "Success";
  } else if (status === 400) {
    response.message = message || "Bad Request";
  }

  return response;
};

module.exports = sendResponse;
