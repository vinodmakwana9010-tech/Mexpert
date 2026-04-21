function MessageBanner({ message }) {
  if (!message.text) return null;
  return (
    <div className={`banner ${message.type === "error" ? "banner-error" : "banner-success"}`}>
      {message.text}
    </div>
  );
}

export default MessageBanner;
