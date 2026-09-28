import { Composition } from "remotion";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./timeline";
import { InstantFunDemo } from "./Video";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="InstantFunDemo"
    component={InstantFunDemo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
