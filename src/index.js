const methods = {
  required: function (value) {
    if (!value) return false;

    return value ? true : false;
  },

  email: function (value) {
    return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
      value
    );
  },

  url: function (value) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
      value
    );
  },
  date: (function () {
    var called = false;
    return function (value) {
      return !/Invalid|NaN/.test(new Date(value).toString());
    };
  })(),

  number: function (value) {
    return /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
  },

  digits: function (value) {
    return /^\d+$/.test(value);
  },
  minlength: function (value, param) {
    var length = value?.length ?? 0;
    return length >= param;
  },
  maxlength: function (value, param) {
    var length = value?.length ?? 0;
    return length <= param;
  },
  rangelength: function (value, low, high) {
    var length = value.length;
    return length >= low && length <= high;
  },

  in: function (value, allowedArray) {
    if (allowedArray.indexOf(value) === -1) return false;
    return true;
  },
  min: function (value, param) {
    return value >= param;
  },

  max: function (value, param) {
    return value <= param;
  },

  range: function (value, low, high) {
    return value >= low && value <= high;
  },

  equalTo: function (value, param) {
    return value === param;
  },
};

const messages = {
  required: "{field} is required.",
  remote: "Please fix this field.",
  email: "Please enter a valid email address.",
  url: "Please enter a valid URL.",
  date: "Please enter a valid date.",
  dateISO: "Please enter a valid date (ISO).",
  number: "{field} should be a valid number.",
  digits: "Please enter only digits.",
  equalTo: "Please enter the same value again.",
  maxlength: "Please enter no more than {__low__val} characters.",
  minlength: "Please enter at least {__low__val} characters.",
  rangelength:
    "Please enter a value between {__low__val} and {__higher__val} characters long.",
  range: "Please enter a value between {__low__val} and {__higher__val}.",
  max: "Please enter a value less than or equal to {__low__val}.",
  min: "Please enter a value greater than or equal to {__low__val}.",
  in: "{__field} is not containing allowed value. Allowed values are {__allowedValues__}",
};

function simpleValidator(body, rules) {
  let errors = {};
  for (field in rules) {
    let field__value = body[field];
    let field__rules = rules[field];
    let field_errors = [];
    for (field__rule__key in field__rules) {
      if (Object.keys(methods).indexOf(field__rule__key) === -1) {
        field_errors.push("Invalid rules provided!");
        continue;
      }
      let field__rule__params = field__rules[field__rule__key] ?? null;
      if (field__rule__key == "range" || field__rule__key == "rangelength") {
        let __lower__val = field__rule__params["min"];
        let __higher__val = field__rule__params["max"] ?? null;
        result = methods[field__rule__key].call(
          null,
          field__value,
          __lower__val,
          __higher__val
        );
        if (!result) {
          let message = messages[field__rule__key]
            .replace("{__field}", field)
            .replace("{__low__val}", __lower__val)
            .replace("{__higher__val}", __higher__val);
          field_errors.push(message);
        }
      } else if (field__rule__key === "in") {
        result = methods[field__rule__key].call(
          null,
          field__value,
          field__rule__params
        );
        if (!result) {
          let message = messages[field__rule__key]
            .replace("{__field}", field)
            .replace("{__allowedValues__}", field__rule__params.toString());
          field_errors.push(message);
        }
      } else {
        result = methods[field__rule__key].call(
          null,
          field__value,
          field__rule__params
        );
        if (!result) {
          let message = messages[field__rule__key]
            .replace("{field}", field)
            .replace("{__low__val}", field__rule__params);
          field_errors.push(message);
        }
      }
    }
    if (field_errors.length) {
      errors[field] = field_errors;
    }
  }

  if (!Object.keys(errors).length) {
    return {
      has_error: false,
      errors: {},
      fields: [],
      first_error: null,
    };
  }

  return {
    has_error: true,
    errors: errors,
    fields: Object.keys(errors),
    first_error: errors[Object.keys(errors)[0]][0] ?? null,
  };
}

module.exports = simpleValidator;
