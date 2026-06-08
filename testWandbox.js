async function testWandbox() {
  const res = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: "cpython-3.10.0",
      code: "print('hello world from wandbox')"
    })
  });
  const data = await res.text();
  console.log(data);
}
testWandbox();
