type WinModalProps = {
  onOk: () => void;
  show: boolean;
};

const WinModal: React.FC<WinModalProps> = ({ onOk, show }) => {
  return (
    <div
      style={{
        backgroundColor: "rgba(0, 0, 0, .4)",
        position: "absolute",
        width: "100vw",
        height: "100vh",
        zIndex: 10,
        left: 0,
        top: 0,
        display: show ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFF",
          padding: "16px",
        }}
      >
        <h2>Congratulations!</h2>
        <p>
          There are no further levels at this point but you can replay the first
          level again :)
        </p>
        <button onClick={onOk}>Great</button>
      </div>
    </div>
  );
};

export default WinModal;
