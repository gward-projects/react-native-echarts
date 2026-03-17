import { PanResponderHandler } from "./PanResponderHandler";
import { RNGestureHandler } from "./RNGestureHandler";
import type { DispatchEvents, RNGestureHandlerGesture, RNGestureHandlerOptions } from "../types";

type GestureHandlerProps = {
  useRNGH?: boolean;
  RNGH?: any;
  dispatchEvents: DispatchEvents;
  gesture?: RNGestureHandlerGesture;
  gestureOptions?: RNGestureHandlerOptions;
};

export function GestureHandler({
                                 useRNGH = false,
                                 RNGH,
                                 dispatchEvents,
                                 gesture,
                                 gestureOptions
                               }: GestureHandlerProps) {
  if (useRNGH && RNGH) {
    return (
      <RNGestureHandler
        RNGH={RNGH}
        dispatchEvents={dispatchEvents}
        gesture={gesture}
        gestureOptions={gestureOptions}
      />
    );
  }

  return <PanResponderHandler dispatchEvents={dispatchEvents} />;
}