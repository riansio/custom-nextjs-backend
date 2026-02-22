export default function handler(req, res) {
  const type = req.query.REQUEST_TYPE;

  if (type === 'CHECK') {
    res.status(200).json({
      success: true,
      productsOwned: {
        monospace0: true,
        polaris0: true
      }
    });
  } else if (type === 'CHECK_BLACKLIST') {
    res.status(200).json({
      enabled: false,
      reason: "",
      level: 0
    });
  } else {
    res.status(200).json({ error: "Not Found" });
  }
}
