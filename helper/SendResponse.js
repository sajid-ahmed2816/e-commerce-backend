const SendResponse = (status, data, message, error) => {
  const ResponseObj = {
    status: null,
    data: null,
    message: "",
    error: "",
  };

  ResponseObj.status = status;
  ResponseObj.data = data;
  ResponseObj.message = message;
  ResponseObj.error = error;

  if (Array.isArray(data)) {
    ResponseObj.count = data.length;
  }
  return ResponseObj;
};

module.exports = { SendResponse };
