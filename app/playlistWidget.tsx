"use client";

type PlaylistWidgetProps = {
  playlist: string;
};

export default function PlaylistWidget({ playlist }: PlaylistWidgetProps) {
  function handleClick(playlist: string) {
    alert("Saving playlist " + playlist);
  }
  return (
    <div>
      <h3>{`playlist ${playlist}`}</h3>
      <button onClick={() => handleClick(playlist)}>Save!</button>
    </div>
  );
}
