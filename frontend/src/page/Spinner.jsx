import LoadingGif from "../assets/loading.gif";

export default function Spinner() {
  return (
    <div className="flex justify-center items-center mt-48">
      <img
        src={LoadingGif}
        alt="Loading..."
        className="w-35 h-35"
      />
    </div>
  );
}
