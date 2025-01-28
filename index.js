/**
 * @param {{ onSelect: ( audio?: MediaDeviceInfo, video?: MediaDeviceInfo ) => void}} param0
 * @param {AbortSignal | undefined} abort
 */
async function SelectDevice({ onSelect }, abort) {
  const devices = await navigator.mediaDevices.enumerateDevices();

  const audio = document.createElement("select");
  const video = document.createElement("select");

  const audioMap = new Map();
  const videoMap = new Map();

  let /** @type {MediaDeviceInfo | undefined} */ devAudio,
    /** @type {MediaDeviceInfo | undefined} */ devVideo;

  for (const device of devices) {
    const option = document.createElement("option");

    option.value = device.deviceId;
    option.append(device.label);

    if (device.kind == "audioinput") {
      devAudio ??= device;

      audio.append(option);
      audioMap.set(device.deviceId, device);
    } else if (device.kind == "videoinput") {
      devVideo ??= device;

      video.append(option);
      videoMap.set(device.deviceId, device);
    }
  }

  const div = document.createElement("div");

  audio.addEventListener("change", () => {
    devAudio = audioMap.get(audio.value);

    onSelect(devAudio, devVideo);
  }, { signal: abort });

  video.addEventListener("change", () => {
    devVideo = videoMap.get(video.value);

    onSelect(devAudio, devVideo);
  }, { signal: abort });

  div.append(audio, video);

  return div;
}

/**
 * @param {{ audioDevice?: MediaDeviceInfo, videoDevice?: MediaDeviceInfo }} param0
 * @param {AbortSignal | undefined} abort
 */
async function Screen({ audioDevice, videoDevice }, abort) {
  const video = document.createElement("video");

  const media = await navigator.mediaDevices.getUserMedia({
    audio: audioDevice,
    video: {
      ...videoDevice,
      width: 1920,
      height: 1080
    }
  })

  video.srcObject = media;

  video.style.width = "100vw";
  video.style.background = "black";
  video.style.aspectRatio = "16 / 9";

  video.play()

  return video
}

/**
 * @param {{}} param0
 * @param {AbortSignal | undefined} rootAbort
 */
async function Main({}, rootAbort) {
  const abort = new AbortController();

  let /** @type {MediaDeviceInfo | undefined} */ devAudio,
    /** @type {MediaDeviceInfo | undefined} */ devVideo;

  /**
   * @param {MediaDeviceInfo | undefined} audio
   * @param {MediaDeviceInfo | undefined} video
   */
  const onSelect = (audio, video) => {
    devAudio = audio;
    devVideo = video;
  };

  const select = await SelectDevice({ onSelect: onSelect }, abort.signal);

  const button = document.createElement("button");
  button.append("確定");

  const container = document.createElement("div");

  button.addEventListener("click", async () => {
    abort.abort();

    for (const node of Array.from(container.childNodes)) {
      container.removeChild(node);
    }

    container.append(await Screen({ audioDevice: devAudio, videoDevice: devVideo }, rootAbort));
  });

  container.append(select, button);

  return container;
}

globalThis.addEventListener("load", async () => {
  document.body.append(await Main({}, undefined));
});
