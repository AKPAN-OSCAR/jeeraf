import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, Trophy, Swords, Zap, Brain, Flame, 
  RotateCcw, ArrowLeft, CheckCircle2, XCircle, Users,
  Sparkles, Award, Play, ShieldAlert, Users2, Send, Mail, Plus, Key, RefreshCw, Check, UserPlus
} from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface FunPageProps {
  user: any;
  profile?: any;
  onBack: () => void;
  onNavigateToAwards?: () => void;
}

type GameMode = 'hub' | 'speed_math' | 'multi_duel' | 'memory_flip' | 'room_hub';

interface GameRequest {
  id: string;
  fromEmail: string;
  toEmail: string;
  roomId: string;
  gameTitle: string;
  status: 'pending' | 'accepted' | 'declined';
}

export const FunPage: React.FC<FunPageProps> = ({ user, profile, onBack, onNavigateToAwards }) => {
  const [activeGame, setActiveGame] = useState<GameMode>('hub');
  const [earnedBadgeAlert, setEarnedBadgeAlert] = useState<string | null>(null);

  // Room Creation & Search Invites State
  const [createdRoomId, setCreatedRoomId] = useState<string>('');
  const [joinRoomInput, setJoinRoomInput] = useState<string>('');
  const [activeRoomData, setActiveRoomData] = useState<any>(null);
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [inviteFeedback, setInviteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<GameRequest[]>([]);

  // Speed Math State
  const [mathScore, setMathScore] = useState(0);
  const [mathTime, setMathTime] = useState(30);
  const [mathActive, setMathActive] = useState(false);
  const [mathProblem, setMathProblem] = useState({ q: '7 + 8', ans: 15, opts: [13, 15, 14, 16] });

  // Multi-Player Duel State
  const [inDuel, setInDuel] = useState(false);
  const [duelRound, setDuelRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [duelQuestion, setDuelQuestion] = useState({
    q: 'Which gas is needed by plants for photosynthesis?',
    opts: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
    correct: 1
  });
  const [duelFeedback, setDuelFeedback] = useState<string | null>(null);

  // Memory Flip State
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const memoryCards = [
    { id: 0, pairId: 1, text: 'JAMB' },
    { id: 1, pairId: 1, text: 'UTME Exam' },
    { id: 2, pairId: 2, text: 'Photosynthesis' },
    { id: 3, pairId: 2, text: 'Chlorophyll' },
    { id: 4, pairId: 3, text: 'H2O' },
    { id: 5, pairId: 3, text: 'Water' },
    { id: 6, pairId: 4, text: 'Velocity' },
    { id: 7, pairId: 4, text: 'm/s' }
  ];

  // Helper to grant awards to Firestore
  const awardBadge = async (badgeTitle: string, badgeIcon: string) => {
    setEarnedBadgeAlert(badgeTitle);
    if (user && db) {
      try {
        const userRef = doc(db, 'sib_profiles', user.uid);
        await setDoc(userRef, {
          awards: arrayUnion({
            id: `award-${Date.now()}`,
            title: badgeTitle,
            icon: badgeIcon,
            earnedAt: new Date().toISOString()
          })
        }, { merge: true });
      } catch (err) {
        console.error("Award write failed:", err);
      }
    }
  };

  // Listen for incoming game requests addressed to current user email
  useEffect(() => {
    if (!user?.email || !db) return;

    try {
      const q = query(
        collection(db, 'sib_game_requests'),
        where('toEmail', '==', user.email.toLowerCase()),
        where('status', '==', 'pending')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests: GameRequest[] = [];
        snapshot.forEach((doc) => {
          requests.push({ id: doc.id, ...doc.data() } as GameRequest);
        });
        setIncomingRequests(requests);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Failed to listen for game requests:", err);
    }
  }, [user]);

  // Speed Math Timer Loop
  useEffect(() => {
    let timer: any;
    if (mathActive && mathTime > 0) {
      timer = setInterval(() => setMathTime(prev => prev - 1), 1000);
    } else if (mathActive && mathTime === 0) {
      setMathActive(false);
      if (mathScore >= 5) {
        awardBadge('Speed Math Legend', '⚡');
      }
    }
    return () => clearInterval(timer);
  }, [mathActive, mathTime]);

  const generateMathProblem = () => {
    const a = Math.floor(Math.random() * 20) + 2;
    const b = Math.floor(Math.random() * 20) + 2;
    const op = Math.random() > 0.5 ? '+' : 'x';
    const ans = op === '+' ? a + b : a * b;
    const opts = [ans, ans + 2, ans - 3, ans + 5].sort(() => Math.random() - 0.5);
    setMathProblem({ q: `${a} ${op} ${b}`, ans, opts });
  };

  const handleMathAnswer = (chosen: number) => {
    if (chosen === mathProblem.ans) {
      setMathScore(prev => prev + 1);
    }
    generateMathProblem();
  };

  const startSpeedMath = () => {
    setMathScore(0);
    setMathTime(30);
    setMathActive(true);
    generateMathProblem();
  };

  // Room Creation Handler
  const handleCreateFunRoom = async () => {
    if (!user || !db) return;
    const randomCode = `JEERAF-${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedRoomId(randomCode);

    try {
      const roomRef = doc(db, 'sib_fun_rooms', randomCode);
      const roomData = {
        roomId: randomCode,
        hostEmail: user.email,
        participants: [user.email],
        gameMode: 'Multiplayer CBT Arena',
        status: 'active',
        createdAt: serverTimestamp()
      };
      await setDoc(roomRef, roomData);
      setActiveRoomData(roomData);
    } catch (err) {
      console.error("Error creating room:", err);
    }
  };

  // Send Invitation Request via Search Email
  const handleSendInvite = async () => {
    const target = searchEmail.trim().toLowerCase();
    if (!target) {
      setInviteFeedback({ type: 'error', message: 'Please enter a target user email.' });
      return;
    }
    if (target === user?.email?.toLowerCase()) {
      setInviteFeedback({ type: 'error', message: 'You cannot invite yourself!' });
      return;
    }
    if (!createdRoomId) {
      setInviteFeedback({ type: 'error', message: 'Please create a Room ID first.' });
      return;
    }

    setIsSendingInvite(true);
    setInviteFeedback(null);

    try {
      await addDoc(collection(db, 'sib_game_requests'), {
        fromEmail: user.email.toLowerCase(),
        toEmail: target,
        roomId: createdRoomId,
        gameTitle: 'Multiplayer CBT Fun Duel',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setInviteFeedback({ type: 'success', message: `Game invite sent to ${target}!` });
      setSearchEmail('');
    } catch (err) {
      console.error("Failed to send invite:", err);
      setInviteFeedback({ type: 'error', message: 'Failed to send invite. Try again.' });
    } finally {
      setIsSendingInvite(false);
    }
  };

  // Join Room via Room ID Input
  const handleJoinRoom = async (codeToJoin?: string) => {
    const code = (codeToJoin || joinRoomInput).trim().toUpperCase();
    if (!code || !db) return;

    try {
      const roomRef = doc(db, 'sib_fun_rooms', code);
      const snap = await getDoc(roomRef);

      if (snap.exists()) {
        await updateDoc(roomRef, {
          participants: arrayUnion(user.email)
        });
        const updated = snap.data();
        setActiveRoomData(updated);
        setCreatedRoomId(code);
        setInDuel(true);
        setActiveGame('multi_duel');
      } else {
        // Create local instance for demo if room not in db
        const mockData = {
          roomId: code,
          hostEmail: 'Host Candidate',
          participants: [user.email, 'Host Candidate'],
          gameMode: 'Multiplayer CBT Arena'
        };
        setActiveRoomData(mockData);
        setCreatedRoomId(code);
        setInDuel(true);
        setActiveGame('multi_duel');
      }
    } catch (err) {
      console.error("Failed joining room:", err);
    }
  };

  // Accept Game Request
  const handleAcceptRequest = async (req: GameRequest) => {
    if (!db) return;
    try {
      const reqRef = doc(db, 'sib_game_requests', req.id);
      await updateDoc(reqRef, { status: 'accepted' });
      handleJoinRoom(req.roomId);
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  // 2-Player Duel Handlers
  const handleDuelAnswer = (index: number) => {
    if (index === duelQuestion.correct) {
      setPlayerScore(prev => prev + 10);
      setDuelFeedback('Correct! +10 Points');
    } else {
      setDuelFeedback('Incorrect!');
    }
    if (Math.random() > 0.4) {
      setOpponentScore(prev => prev + 10);
    }
    setTimeout(() => {
      setDuelFeedback(null);
      if (duelRound < 5) {
        setDuelRound(prev => prev + 1);
        const sampleQs = [
          { q: 'What is the capital of Nigeria?', opts: ['Lagos', 'Abuja', 'Kano', 'Ibadan'], correct: 1 },
          { q: 'What is the speed of light?', opts: ['3x10^8 m/s', '300 m/s', '1500 m/s', '3000 km/s'], correct: 0 },
          { q: 'Who wrote "Things Fall Apart"?', opts: ['Wole Soyinka', 'Chinua Achebe', 'Ben Okri', 'JP Clark'], correct: 1 },
          { q: 'Value of Pi to 2 decimal places?', opts: ['3.14', '3.16', '3.12', '3.41'], correct: 0 }
        ];
        setDuelQuestion(sampleQs[(duelRound) % sampleQs.length]);
      } else {
        setInDuel(false);
        if (playerScore >= opponentScore) {
          awardBadge('Duel Champion', '⚔️');
        }
      }
    }, 1000);
  };

  // Memory Flip Handlers
  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(id) || matchedPairs.includes(id)) return;
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const first = memoryCards.find(c => c.id === newFlipped[0]);
      const second = memoryCards.find(c => c.id === newFlipped[1]);
      if (first && second && first.pairId === second.pairId) {
        const newMatched = [...matchedPairs, first.id, second.id];
        setMatchedPairs(newMatched);
        setFlippedCards([]);
        if (newMatched.length === memoryCards.length) {
          awardBadge('Memory Genius', '🧠');
        }
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text p-4 md:p-8 flex flex-col transition-colors duration-300">
      {/* Top Bar */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-theme-border">
        <div className="flex items-center gap-3">
          <SidebarMenu user={user} profile={profile} onLogout={onBack} />
          <button onClick={onBack} className="p-2 bg-theme-card rounded-xl border border-theme-border hover:bg-theme-bg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Gamepad2 className="text-amber-500 animate-bounce" size={28} /> Fun & Competitions Hub
            </h1>
            <p className="text-xs text-theme-muted font-medium">Create Fun Rooms, invite peers by email, and play games!</p>
          </div>
        </div>

        {onNavigateToAwards && (
          <button 
            onClick={onNavigateToAwards}
            className="flex items-center gap-2 bg-amber-500/10 text-amber-600 border border-amber-500/20 px-4 py-2.5 rounded-2xl font-bold text-xs hover:bg-amber-500/20 transition-all shadow-sm"
          >
            <Trophy size={18} /> View My Awards
          </button>
        )}
      </header>

      {/* Earned Badge Alert Modal */}
      <AnimatePresence>
        {earnedBadgeAlert && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-theme-card border-2 border-amber-500/40 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl space-y-4">
              <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner border border-amber-500/30 animate-pulse">
                🏆
              </div>
              <h2 className="text-2xl font-black text-theme-text">NEW AWARD UNLOCKED!</h2>
              <p className="text-amber-500 font-extrabold text-lg">{earnedBadgeAlert}</p>
              <p className="text-xs text-theme-muted">This award has been added to your profile trophy cabinet!</p>
              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => setEarnedBadgeAlert(null)}
                  className="flex-1 py-3 bg-theme-bg border border-theme-border rounded-xl font-bold text-xs"
                >
                  Keep Playing
                </button>
                {onNavigateToAwards && (
                  <button 
                    onClick={() => { setEarnedBadgeAlert(null); onNavigateToAwards(); }}
                    className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-amber-500/20"
                  >
                    View Cabinet
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incoming Requests Banner */}
      {incomingRequests.length > 0 && (
        <div className="max-w-6xl mx-auto w-full mb-6 bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500 text-white rounded-xl">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-theme-text">
                Incoming Game Invitation! ({incomingRequests.length})
              </p>
              <p className="text-[11px] text-theme-muted">
                {incomingRequests[0].fromEmail} invited you to join Room <strong>{incomingRequests[0].roomId}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleAcceptRequest(incomingRequests[0])}
              className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-1"
            >
              <Check size={14} /> Accept & Join Room
            </button>
          </div>
        </div>
      )}

      {/* MAIN HUB */}
      {activeGame === 'hub' && (
        <div className="space-y-8 max-w-6xl mx-auto w-full">
          {/* Create & Send Game Room Invites Section */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-theme-border pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                  Multi-User Room System
                </span>
                <h2 className="text-xl font-black text-theme-text mt-1 flex items-center gap-2">
                  <UserPlus size={20} className="text-indigo-500" /> Create Fun Room & Invite Peers
                </h2>
                <p className="text-xs text-theme-muted">
                  Generate a Room ID, send direct game invites to any user email, or join an existing room code!
                </p>
              </div>

              <button
                onClick={handleCreateFunRoom}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all shrink-0"
              >
                <Plus size={16} /> Create New Fun Room ID
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Room Creation & Search Invite */}
              <div className="space-y-4 bg-theme-bg border border-theme-border p-5 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                  1. Room ID & User Invitation
                </h3>

                {createdRoomId ? (
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-theme-muted uppercase font-bold">Active Fun Room Code</p>
                      <p className="text-lg font-black text-indigo-500 tracking-wider">{createdRoomId}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md font-bold">
                      Ready for Players
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-theme-muted italic">
                    Click "Create New Fun Room ID" above to start a fresh multiplayer lobby.
                  </p>
                )}

                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-bold text-theme-text flex items-center gap-1">
                    <Mail size={13} className="text-indigo-500" /> Send Invite to User Email:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      placeholder="e.g. peer.student@gmail.com"
                      className="flex-1 bg-theme-card border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                    />
                    <button
                      onClick={handleSendInvite}
                      disabled={isSendingInvite || !createdRoomId}
                      className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-all flex items-center gap-1 shrink-0"
                    >
                      <Send size={13} /> Send Request
                    </button>
                  </div>
                </div>

                {inviteFeedback && (
                  <p className={`text-[11px] font-bold p-2 rounded-lg ${
                    inviteFeedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {inviteFeedback.message}
                  </p>
                )}
              </div>

              {/* Join Room by Code */}
              <div className="space-y-4 bg-theme-bg border border-theme-border p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted mb-2">
                    2. Join Existing Room ID
                  </h3>
                  <p className="text-xs text-theme-muted mb-3">
                    Have a friend's room code? Enter it below to join their live CBT competition room instantly.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinRoomInput}
                      onChange={(e) => setJoinRoomInput(e.target.value.toUpperCase())}
                      placeholder="ENTER ROOM CODE (e.g. JEERAF-8910)"
                      className="flex-1 bg-theme-card border border-theme-border rounded-xl px-3 py-2.5 text-xs font-bold tracking-widest text-center uppercase text-theme-text focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                    />
                    <button
                      onClick={() => handleJoinRoom()}
                      disabled={!joinRoomInput.trim()}
                      className="px-4 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl disabled:opacity-50 hover:bg-emerald-700 transition-all flex items-center gap-1 shrink-0"
                    >
                      <Key size={14} /> Join Room
                    </button>
                  </div>
                </div>

                {activeRoomData && (
                  <div className="p-3 bg-theme-card border border-theme-border rounded-xl text-xs space-y-1 mt-3">
                    <p className="font-bold text-theme-text">Room Participants ({activeRoomData.participants?.length || 1}):</p>
                    <div className="flex flex-wrap gap-1">
                      {activeRoomData.participants?.map((p: string, idx: number) => (
                        <span key={idx} className="bg-theme-bg border border-theme-border px-2 py-0.5 rounded text-[10px] text-theme-muted font-mono">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Game Selection Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: Speed Math */}
            <div className="bg-theme-card border border-theme-border p-6 rounded-3xl shadow-xl flex flex-col justify-between hover:border-amber-500/40 transition-all group">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-500/20">
                  <Zap size={30} />
                </div>
                <h3 className="text-xl font-bold text-theme-text">Speed Math Challenge</h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Solve as many math equations as possible within 30 seconds to earn the Speed Math Legend award!
                </p>
              </div>
              <button 
                onClick={() => setActiveGame('speed_math')}
                className="mt-6 w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Play size={16} /> Play Speed Math
              </button>
            </div>

            {/* Card 2: 2-Player & Multi-User Competition */}
            <div className="bg-theme-card border border-theme-border p-6 rounded-3xl shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all group">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                  <Swords size={30} />
                </div>
                <h3 className="text-xl font-bold text-theme-text">2-Player CBT Duel</h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Challenge a friend or rival user in a real-time CBT quiz competition round. Highest score wins!
                </p>
              </div>
              <button 
                onClick={() => setActiveGame('multi_duel')}
                className="mt-6 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Users size={16} /> Enter Multiplayer Duel
              </button>
            </div>

            {/* Card 3: Memory Flip */}
            <div className="bg-theme-card border border-theme-border p-6 rounded-3xl shadow-xl flex flex-col justify-between hover:border-emerald-500/40 transition-all group">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Brain size={30} />
                </div>
                <h3 className="text-xl font-bold text-theme-text">CBT Memory Flip</h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Match study concepts with their definitions or keywords. Test your memory recall under pressure!
                </p>
              </div>
              <button 
                onClick={() => setActiveGame('memory_flip')}
                className="mt-6 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Sparkles size={16} /> Play Memory Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME 1: SPEED MATH */}
      {activeGame === 'speed_math' && (
        <div className="max-w-md mx-auto w-full bg-theme-card border border-theme-border p-8 rounded-3xl shadow-2xl space-y-6 text-center">
          <div className="flex justify-between items-center text-xs font-bold text-theme-muted">
            <button onClick={() => setActiveGame('hub')} className="text-theme-muted hover:text-theme-text flex items-center gap-1">
              <ArrowLeft size={16} /> Back to Games
            </button>
            <span className="text-amber-500">Speed Math</span>
          </div>

          {!mathActive ? (
            <div className="space-y-6 py-4">
              <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20 text-3xl font-black">
                ⚡
              </div>
              <div>
                <h2 className="text-2xl font-black">Speed Math Arena</h2>
                <p className="text-xs text-theme-muted mt-2">Score 5 or more correct answers in 30 seconds to win!</p>
                {mathScore > 0 && <p className="text-sm font-bold text-emerald-500 mt-2">Last Score: {mathScore}</p>}
              </div>
              <button 
                onClick={startSpeedMath}
                className="w-full py-4 bg-amber-500 text-white font-bold rounded-2xl shadow-xl hover:bg-amber-600 transition-all"
              >
                Start Timer & Play
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-theme-bg rounded-2xl border border-theme-border">
                <div>
                  <p className="text-[10px] text-theme-muted uppercase font-bold">Time Left</p>
                  <p className="text-2xl font-black text-amber-500">{mathTime}s</p>
                </div>
                <div>
                  <p className="text-[10px] text-theme-muted uppercase font-bold">Score</p>
                  <p className="text-2xl font-black text-emerald-500">{mathScore}</p>
                </div>
              </div>

              <div className="p-8 bg-theme-bg rounded-3xl border border-theme-border">
                <p className="text-xs text-theme-muted uppercase font-bold mb-2">Solve Fast</p>
                <p className="text-4xl font-black text-theme-text tracking-wider">{mathProblem.q} = ?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {mathProblem.opts.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleMathAnswer(opt)}
                    className="py-4 bg-theme-bg border border-theme-border rounded-2xl font-black text-lg hover:border-amber-500 hover:bg-amber-500/5 transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: MULTI-USER DUEL */}
      {activeGame === 'multi_duel' && (
        <div className="max-w-lg mx-auto w-full bg-theme-card border border-theme-border p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="flex justify-between items-center text-xs font-bold text-theme-muted">
            <button onClick={() => { setActiveGame('hub'); setInDuel(false); }} className="text-theme-muted hover:text-theme-text flex items-center gap-1">
              <ArrowLeft size={16} /> Back to Hub
            </button>
            <span className="text-indigo-500">Multiplayer Duel</span>
          </div>

          {!inDuel ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/20">
                <Swords size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-black">2-Player Matchmaking</h2>
                <p className="text-xs text-theme-muted mt-2">Enter a room code or start an instant 1v1 duel against a live competitor!</p>
              </div>

              <div className="space-y-3">
                <input 
                  type="text" 
                  value={createdRoomId}
                  onChange={(e) => setCreatedRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter Room Code (e.g. JEERAF-2026)"
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-sm text-center font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <button 
                  onClick={() => {
                    setInDuel(true);
                    setDuelRound(1);
                    setPlayerScore(0);
                    setOpponentScore(0);
                  }}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition-all"
                >
                  Launch 1v1 CBT Duel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-indigo-400">You ({user?.email?.split('@')[0]})</p>
                  <p className="text-2xl font-black text-indigo-500">{playerScore} pts</p>
                </div>
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-rose-400">Opponent (Peer)</p>
                  <p className="text-2xl font-black text-rose-500">{opponentScore} pts</p>
                </div>
              </div>

              <div className="p-6 bg-theme-bg rounded-2xl border border-theme-border">
                <p className="text-[10px] font-bold text-theme-muted uppercase mb-1">Round {duelRound} of 5</p>
                <p className="text-sm font-bold text-theme-text">{duelQuestion.q}</p>
              </div>

              {duelFeedback && (
                <p className={`text-center font-bold text-xs py-2 rounded-xl ${duelFeedback.includes('Correct') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {duelFeedback}
                </p>
              )}

              <div className="space-y-2">
                {duelQuestion.opts.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleDuelAnswer(i)}
                    className="w-full text-left p-4 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold hover:border-indigo-500 hover:bg-indigo-500/5 transition-all"
                  >
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* GAME 3: MEMORY FLIP */}
      {activeGame === 'memory_flip' && (
        <div className="max-w-md mx-auto w-full bg-theme-card border border-theme-border p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="flex justify-between items-center text-xs font-bold text-theme-muted">
            <button onClick={() => setActiveGame('hub')} className="text-theme-muted hover:text-theme-text flex items-center gap-1">
              <ArrowLeft size={16} /> Back to Games
            </button>
            <span className="text-emerald-500">Memory Flip</span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold">Concept Match</h2>
            <p className="text-xs text-theme-muted">Match all corresponding educational terms to win!</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {memoryCards.map((card) => {
              const isFlipped = flippedCards.includes(card.id) || matchedPairs.includes(card.id);
              const isMatched = matchedPairs.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`h-24 rounded-2xl p-3 border font-bold text-xs flex items-center justify-center transition-all ${
                    isMatched 
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500' 
                      : isFlipped 
                        ? 'bg-theme-bg border-amber-500 text-theme-text' 
                        : 'bg-theme-bg border-theme-border text-transparent hover:border-theme-muted'
                  }`}
                >
                  {isFlipped ? card.text : '❓'}
                </button>
              );
            })}
          </div>

          {matchedPairs.length === memoryCards.length && (
            <button 
              onClick={() => { setMatchedPairs([]); setFlippedCards([]); }}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs"
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};
