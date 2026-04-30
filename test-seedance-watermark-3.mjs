async function test() {
  const apiKey = process.env.ARK_API_KEY;
  const res = await fetch("https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.SEEDANCE_MODEL,
      content: [{ type: "text", text: "一只可爱的小猫在跑" }],
      watermark: false,
      logo_info: { add_logo: false }
    })
  });
  console.log(await res.text());
}
test();
