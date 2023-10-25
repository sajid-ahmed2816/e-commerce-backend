const ResponseObj = {
  status: null,
  data: null,
  message: "",
  error: "",
};

const SendResponse = (status, data, message, error) => {
  ResponseObj.status = status;
  ResponseObj.data = data;
  ResponseObj.message = message;
  ResponseObj.error = error;

  if (data && Array.isArray(data)) {
    ResponseObj.count = data.length;
  } else {
    ResponseObj.count = 0;
  }

  return ResponseObj;
};

module.exports = { SendResponse };
