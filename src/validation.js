document.querySelector('#num_format').addEventListener("change", function() { change_imp(); });

function validate_sparm(e, field) {
  e.preventDefault();

  const qField = document.getElementById(field);
  let valid = true;

  if (!/^-?0+(\.[0-9]*)?$/.test(qField.value)) {
    qField.classList.add("is-invalid");
    qField.classList.remove("is-valid");
  } else {
    qField.classList.add("is-valid");
    qField.classList.remove("is-invalid");
  }
  return valid;
}
function validate_positive(e, field) {
  e.preventDefault();

  const qField = document.getElementById(field);
  let valid = true;

  if (!/^[0-9]+(\.[0-9]*)?$/.test(qField.value)) {
    qField.classList.add("is-invalid");
    qField.classList.remove("is-valid");
  } else {
    qField.classList.add("is-valid");
    qField.classList.remove("is-invalid");
  }
  return valid;
}
function validate_number(e, field) {
  e.preventDefault();

  const qField = document.getElementById(field);
  let valid = true;

  if (!/^-?[0-9]+(\.[0-9]*)?$/.test(qField.value)) {
    qField.classList.add("is-invalid");
    qField.classList.remove("is-valid");
  } else {
    qField.classList.add("is-valid");
    qField.classList.remove("is-invalid");
  }
  return valid;
}

const s11re = document.getElementById("s11_re");
s11re.addEventListener('focusout', (e) => validate_number(e, "s11_re"));
const s11im = document.getElementById("s11_im");
s11im.addEventListener('focusout', (e) => validate_number(e, "s11_im"));
