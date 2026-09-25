import handler from '../api/analyze.js';

async function runTest() {
  const req = {
    method: 'POST',
    body: {
      paragraph: "Technology has transformed the way we live, work, and communicate. It brings people closer, creates new opportunities, and solves real-world problems.",
      typedText: "zzzzzzzzzzzzzzzzzzzz", // All wrong characters!
      wpm: 0,
      accuracy: 0,
      errors: 20,
      elapsedTime: 15,
      difficulty: "Medium",
      duration: 60
    }
  };

  const res = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) {
      console.log("RESPONSE JSON:\n", JSON.stringify(data, null, 2));
      return this;
    },
    writeHead(code, headers) { this.statusCode = code; return this; },
    end(str) {
      console.log("RESPONSE END:\n", str);
      return this;
    }
  };

  console.log("Calling analyze handler with completely wrong typed text...");
  await handler(req, res);
}

runTest();
