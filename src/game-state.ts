
import AsyncLock from 'async-lock';

type BotSide = 'home' | 'away';

export type StudioState = {
    serverIsRunning: boolean;
    gameIsRunning: boolean;
    grpcClientsConnected: boolean;
    gameSpeed: number;
    playerSide: BotSide;
    opponentSide: BotSide;
};

const StudioState = (function () {
    const lock = new AsyncLock();
    let _val: StudioState = {
        serverIsRunning: false,
        gameIsRunning: false,
        grpcClientsConnected: false,
        gameSpeed: 1,
        playerSide: 'home',
        opponentSide: 'away',
    };

    function setState(newState: StudioState | ((oldState: StudioState) => StudioState)) {
        return lock.acquire<StudioState>(
            'game-state',
            function (done) {
                setTimeout(() => {
                    console.log('LOCK:, ESTOU ALTERANDO');
                    _val = (typeof newState == 'function')  ? newState(_val)  :  newState;
                    done(null, _val);
                }, 200);
            },
            {},
        ).then((value) => {
            console.log('UNLOCK: ESTADO ALTERADO PARA: ', value['gameSpeed']);
             return value;
        });
    }

       async function getState<K extends keyof StudioState>(field?: K) {
        return lock.acquire<StudioState | StudioState[K]>(
            'game-state',
            function (done) {
                setTimeout(() => {
                    console.log('LOCK:, ESTOU LENDO');
                    const value = field ? _val[field] : _val;  
                    done(null, value);
                }, 200);
            },
            {},
        ).then((value) => {
            console.log('UNLOCK: ESTADO LIDO' );
            return value;
        });
    }

    function set<K extends keyof StudioState>(key: K, value: StudioState[K] | ((oldState: StudioState[K]) => StudioState[K])) {
        if((typeof value == 'function') ) {
            const newState = (oldState: StudioState): StudioState => {
                return {...oldState, [key]: value(oldState[key])};
            }
            return setState(newState);
            
        } 

        return setState({..._val, [key]: value});
    }

    const getWithoutLock = <K extends keyof StudioState>(field?: K) => {
        if(field === undefined) return _val;
        return _val[field];
    }

    return {
        set,

        getState,
        setState,
        getWithoutLock,

        setServerIsRunning: (value: boolean) => set('serverIsRunning', value),
        sameIsRunning: (value: boolean) => set('gameIsRunning', value),
        setGrpcClientsConnected: (value: boolean) => set('grpcClientsConnected', value),
        setGameSpeed: (value: number | ((old: number) => number)) => set('gameSpeed', value),
        setPlayerSide: (value: BotSide) => set('playerSide', value),
        setOpponentSide: (value: BotSide) => set('opponentSide', value),
    };
})();

export default StudioState;
