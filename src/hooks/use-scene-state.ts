/**
 * 场景状态管理Hook
 * 使用useReducer管理复杂状态，符合React最佳实践
 */

import { useReducer, useCallback, useRef } from 'react';
import type { SceneState, SceneAction, Message, SceneInfo } from '@/types/scene';
import { SCENE_CONFIG } from '@/config/scene';

// 初始状态
const initialState: SceneState = {
  scene: null,
  messages: [],
  input: '',
  currentTurn: 0,
  totalScore: 0,
  scoreChange: null,
  turnScores: [],
  isGeneratingScene: false,
  isSending: false,
  isTyping: false,
  currentAIMessage: '',
  isFinished: false,
  apiKey: undefined,
};

// 状态更新函数
function sceneReducer(state: SceneState, action: SceneAction): SceneState {
  switch (action.type) {
    case 'SET_SCENE':
      return { ...state, scene: action.payload };
    
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        ),
      };
    
    case 'SET_INPUT':
      return { ...state, input: action.payload };
    
    case 'INCREMENT_TURN':
      return { ...state, currentTurn: state.currentTurn + 1 };
    
    case 'SET_TOTAL_SCORE':
      return { ...state, totalScore: action.payload };
    
    case 'SET_SCORE_CHANGE':
      return { ...state, scoreChange: action.payload };
    
    case 'ADD_TURN_SCORE':
      return { ...state, turnScores: [...state.turnScores, action.payload] };
    
    case 'SET_GENERATING_SCENE':
      return { ...state, isGeneratingScene: action.payload };
    
    case 'SET_SENDING':
      return { ...state, isSending: action.payload };
    
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    
    case 'SET_CURRENT_AI_MESSAGE':
      return { ...state, currentAIMessage: action.payload };
    
    case 'SET_FINISHED':
      return { ...state, isFinished: action.payload };
    
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload };
    
    case 'RESET_SCENE':
      return initialState;
    
    default:
      return state;
  }
}

export interface UseSceneStateReturn {
  state: SceneState;
  actions: {
    setScene: (scene: SceneInfo) => void;
    addMessage: (message: Message) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    setInput: (input: string) => void;
    incrementTurn: () => void;
    setTotalScore: (score: number) => void;
    setScoreChange: (change: number | null) => void;
    addTurnScore: (score: number) => void;
    setGeneratingScene: (generating: boolean) => void;
    setSending: (sending: boolean) => void;
    setTyping: (typing: boolean) => void;
    setCurrentAIMessage: (message: string) => void;
    setFinished: (finished: boolean) => void;
    setApiKey: (apiKey: string | undefined) => void;
    resetScene: () => void;
  };
  // 计算属性
  computed: {
    canSubmit: boolean;
    isGameOver: boolean;
    hasPassed: boolean;
    progressPercentage: number;
    averageScore: number;
  };
}

export function useSceneState(): UseSceneStateReturn {
  const [state, dispatch] = useReducer(sceneReducer, initialState);
  
  // 防止重复初始化的ref
  const hasInitializedRef = useRef(false);
  const initInFlightRef = useRef<Promise<void> | null>(null);

  // 动作函数
  const actions = {
    setScene: useCallback((scene: SceneInfo) => {
      dispatch({ type: 'SET_SCENE', payload: scene });
    }, []),

    addMessage: useCallback((message: Message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    }, []),

    updateMessage: useCallback((id: string, updates: Partial<Message>) => {
      dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
    }, []),

    setInput: useCallback((input: string) => {
      dispatch({ type: 'SET_INPUT', payload: input });
    }, []),

    incrementTurn: useCallback(() => {
      dispatch({ type: 'INCREMENT_TURN' });
    }, []),

    setTotalScore: useCallback((score: number) => {
      dispatch({ type: 'SET_TOTAL_SCORE', payload: score });
    }, []),

    setScoreChange: useCallback((change: number | null) => {
      dispatch({ type: 'SET_SCORE_CHANGE', payload: change });
    }, []),

    addTurnScore: useCallback((score: number) => {
      dispatch({ type: 'ADD_TURN_SCORE', payload: score });
    }, []),

    setGeneratingScene: useCallback((generating: boolean) => {
      dispatch({ type: 'SET_GENERATING_SCENE', payload: generating });
    }, []),

    setSending: useCallback((sending: boolean) => {
      dispatch({ type: 'SET_SENDING', payload: sending });
    }, []),

    setTyping: useCallback((typing: boolean) => {
      dispatch({ type: 'SET_TYPING', payload: typing });
    }, []),

    setCurrentAIMessage: useCallback((message: string) => {
      dispatch({ type: 'SET_CURRENT_AI_MESSAGE', payload: message });
    }, []),

    setFinished: useCallback((finished: boolean) => {
      dispatch({ type: 'SET_FINISHED', payload: finished });
    }, []),

    setApiKey: useCallback((apiKey: string | undefined) => {
      dispatch({ type: 'SET_API_KEY', payload: apiKey });
    }, []),

    resetScene: useCallback(() => {
      dispatch({ type: 'RESET_SCENE' });
    }, []),
  };

  // 计算属性
  const computed = {
    get canSubmit() {
      return !!(
        state.input.trim() &&
        !state.isSending &&
        !state.isFinished &&
        state.scene
      );
    },

    get isGameOver() {
      return state.currentTurn >= SCENE_CONFIG.MAX_TURNS || state.isFinished;
    },

    get hasPassed() {
      return state.totalScore >= SCENE_CONFIG.PASS_SCORE;
    },

    get progressPercentage() {
      return Math.min((state.currentTurn / SCENE_CONFIG.MAX_TURNS) * 100, 100);
    },

    get averageScore() {
      if (state.turnScores.length === 0) return 0;
      return state.turnScores.reduce((sum, score) => sum + score, 0) / state.turnScores.length;
    },
  };

  return {
    state,
    actions,
    computed,
  };
}

// 初始化相关的refs在组件内部管理，不需要导出
