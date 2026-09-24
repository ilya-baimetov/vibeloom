(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const fields = document.getElementById('contact-fields');
  const submit = document.getElementById('contact-submit');
  const success = document.getElementById('contact-success');
  const error = document.getElementById('contact-error');
  let pending = false;
  submit.disabled = false;

  form.addEventListener('input', () => {
    success.textContent = '';
    error.textContent = '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    const data = new FormData(form);
    const payload = {
      name: data.get('name').trim(),
      email: data.get('email').trim(),
      comment: data.get('comment').trim(),
      website: data.get('website'),
    };
    if (!payload.name) {
      error.textContent = 'Please enter your name.';
      form.elements.name.focus();
      return;
    }
    pending = true;
    fields.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submit.textContent = 'Submitting...';
    success.textContent = '';
    error.textContent = '';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || 'We could not submit your request. Please try again.');
      }
      form.reset();
      success.textContent = "Thank you. Your request has been submitted. I'll reply by email, usually within two business days.";
    } catch (failure) {
      error.textContent = failure.name === 'AbortError'
        ? 'The connection timed out. Please try again; your details are still here.'
        : failure instanceof TypeError || failure instanceof SyntaxError
          ? 'We could not reach the server. Please try again, or email info@vibeloom.ai.'
          : failure.message;
    } finally {
      clearTimeout(timeout);
      pending = false;
      fields.disabled = false;
      form.removeAttribute('aria-busy');
      submit.textContent = 'Submit request';
      if (form.closest('details').open) {
        (error.textContent ? error : success).focus();
      }
    }
  });
})();
