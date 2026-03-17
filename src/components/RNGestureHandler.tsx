import { useMemo } from "react";
import { View } from "react-native";
import type { Gesture, GestureDetector } from "react-native-gesture-handler";
import { styles } from "./styles";
import type { DefaultRNGestures, DispatchEvents, RNGestureHandlerGesture, RNGestureHandlerOptions } from "../types";
import { throttle } from "../utils/throttle";

interface RNGHType {
  Gesture: typeof Gesture;
  GestureDetector: typeof GestureDetector;
}

export const getDefaultPanRNGesture = (
  Gesture: RNGHType["Gesture"],
  dispatchEvents: DispatchEvents,
  options?: RNGestureHandlerOptions
) => {
  const panThrottleMs = options?.panThrottleMs ?? 50;
  const longPressMs = options?.longPressMs ?? 0;
  const onGestureActiveChange = options?.onGestureActiveChange;

  return Gesture.Pan()
    .runOnJS(true)
    .withTestId("RNGH-pan-handler")
    .maxPointers(1)
    .activateAfterLongPress(longPressMs)
    .onBegin((e) => {
      onGestureActiveChange?.(true);
      dispatchEvents(["mousedown", "mousemove"], e);
    })
    .onUpdate(
      throttle((e) => {
        dispatchEvents(["mousemove"], e);
      }, panThrottleMs)
    )
    .onEnd((e) => {
      dispatchEvents(["mouseup"], e);
    })
    .onFinalize(() => {
      onGestureActiveChange?.(false);
    });
};

export const getDefaultPinchRNGesture = (
  Gesture: RNGHType["Gesture"],
  dispatchEvents: DispatchEvents,
  options?: RNGestureHandlerOptions
) => {
  const pinchThrottleMs = options?.pinchThrottleMs ?? 50;
  const onGestureActiveChange = options?.onGestureActiveChange;

  return Gesture.Pinch()
    .runOnJS(true)
    .withTestId("RNGH-pinch-handler")
    .onBegin(() => {
      onGestureActiveChange?.(true);
    })
    .onUpdate(
      throttle((e) => {
        dispatchEvents(["mousewheel"], e, {
          zrX: e.focalX,
          zrY: e.focalY,
          zrDelta: e.velocity / 20
        });
      }, pinchThrottleMs)
    )
    .onFinalize(() => {
      onGestureActiveChange?.(false);
    });
};

export const getDefaultTapRNGesture = (
  Gesture: RNGHType["Gesture"],
  dispatchEvents: DispatchEvents
) => {
  return Gesture.Tap()
    .runOnJS(true)
    .withTestId("RNGH-tap-handler")
    .onStart((e) => {
      dispatchEvents(["mousedown", "mousemove"], e);
    })
    .onEnd((e) => {
      dispatchEvents(["mouseup", "click"], e);
    });
};

export const getDefaultRNGestures = (
  Gesture: RNGHType["Gesture"],
  dispatchEvents: DispatchEvents,
  options?: RNGestureHandlerOptions
): DefaultRNGestures => {
  return [
    getDefaultPanRNGesture(Gesture, dispatchEvents, options),
    getDefaultPinchRNGesture(Gesture, dispatchEvents, options),
    getDefaultTapRNGesture(Gesture, dispatchEvents)
  ];
};

type RNGestureHandlerProps = {
  RNGH: RNGHType;
  dispatchEvents: DispatchEvents;
  gesture?: RNGestureHandlerGesture;
  gestureOptions?: RNGestureHandlerOptions;
};

export function RNGestureHandler({
                                   RNGH,
                                   dispatchEvents,
                                   gesture: gestureProp,
                                   gestureOptions
                                 }: RNGestureHandlerProps) {
  const { Gesture, GestureDetector } = RNGH;

  const defaultGestures = useMemo(
    () => getDefaultRNGestures(Gesture, dispatchEvents, gestureOptions),
    [dispatchEvents, Gesture, gestureOptions]
  );

  const propGesture = useMemo(() => {
    if (!gestureProp) {
      return defaultGestures;
    }

    if (typeof gestureProp === "function") {
      return gestureProp(defaultGestures, dispatchEvents);
    }

    return gestureProp;
  }, [defaultGestures, dispatchEvents, gestureProp]);

  const gesture = useMemo(() => {
    if (Array.isArray(propGesture)) {
      return Gesture.Race(...propGesture);
    }

    return propGesture;
  }, [Gesture, propGesture]);

  return (
    <GestureDetector gesture={gesture}>
      <View testID="gesture-handler" style={styles.GestureView} />
    </GestureDetector>
  );
}