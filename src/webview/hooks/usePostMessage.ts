import { useEffect, useRef, useState, useCallback } from 'react';
import { DiagramSpec } from '../../core/schema.js';

declare function acquireVsCodeApi(): {
  postMessage: (message: any) => void;
  setState: (state: any) => void;
  getState: () => any;
};

let vscodeApi: any = null;
if (typeof acquireVsCodeApi === 'function') {
  vscodeApi = acquireVsCodeApi();
}

export function usePostMessage() {
  const [diagram, setDiagram] = useState<DiagramSpec | null>(null);
  const [lastActor, setLastActor] = useState<string>('human');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case 'INIT_STATE':
        case 'FILE_EXTERNALLY_UPDATED':
          setDiagram(message.payload);
          if (message.actor) {
            setLastActor(message.actor);
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify extension host that webview is ready
    if (vscodeApi) {
      vscodeApi.postMessage({ type: 'WEBVIEW_READY' });
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const dispatchChanges = useCallback((updatedDiagram: DiagramSpec) => {
    setDiagram(updatedDiagram);
    if (vscodeApi) {
      vscodeApi.postMessage({
        type: 'DISPATCH_CHANGES',
        payload: updatedDiagram,
      });
    }
  }, []);

  const triggerAutoLayout = useCallback((strategy: 'left-to-right' | 'top-to-bottom' = 'left-to-right') => {
    if (vscodeApi) {
      vscodeApi.postMessage({
        type: 'APPLY_LAYOUT',
        strategy,
      });
    }
  }, []);

  return {
    diagram,
    lastActor,
    dispatchChanges,
    triggerAutoLayout,
  };
}
