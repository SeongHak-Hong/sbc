import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updatePassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!auth) {
            setError('파이어베이스 환경 변수가 설정되지 않았습니다. .env 파일을 확인해 주세요.');
            return;
        }

        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/manager-lounge');
        } catch (err) {
            setError('이메일 또는 비밀번호가 일치하지 않거나 권한이 없습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (newPassword.length < 6) {
            setError('비밀번호는 최소 6자리 이상이어야 합니다.');
            return;
        }

        setLoading(true);

        try {
            // 먼저 현재 비밀번호로 로그인하여 인증 갱신
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // 비밀번호 업데이트
            await updatePassword(userCredential.user, newPassword);
            
            alert('비밀번호가 성공적으로 변경되었습니다. 변경된 비밀번호로 로그인 되었습니다.');
            navigate('/manager-lounge');
        } catch (err) {
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                setError('이메일 또는 현재 비밀번호가 일치하지 않습니다.');
            } else {
                setError('비밀번호 변경에 실패했습니다: ' + err.message);
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        const provider = new GoogleAuthProvider();

        try {
            await signInWithPopup(auth, provider);
            navigate('/manager-lounge');
        } catch (err) {
            let errorMsg = '구글 로그인 실패: ' + err.message;
            if (err.code === 'auth/unauthorized-domain') {
                errorMsg = '이 도메인이 Firebase 인증 허용 목록에 없습니다. (Firebase 콘솔 > Authentication > Settings > Authorized domains 에 현재 주소를 추가해주세요)';
            } else if (err.code === 'auth/popup-closed-by-user') {
                errorMsg = '로그인 창이 닫혔습니다. 다시 시도해주세요.';
            }
            setError(errorMsg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsChangingPassword(!isChangingPassword);
        setError('');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginBox}>
                <h1 className={styles.title}>SBC Manager Lounge</h1>
                <p className={styles.subtitle}>
                    {isChangingPassword ? '초기 비밀번호를 새 비밀번호로 변경해주세요.' : '접근 권한이 있는 계정으로 로그인해주세요.'}
                </p>
                
                {error && <div className={styles.error}>{error}</div>}

                {isChangingPassword ? (
                    <form onSubmit={handlePasswordChangeSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>이메일</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>현재 비밀번호</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="예: 1234"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>새 비밀번호</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="6자 이상"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>새 비밀번호 확인</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <button type="submit" className={styles.loginButton} disabled={loading}>
                            {loading ? '변경 중...' : '비밀번호 변경하기'}
                        </button>
                        <button type="button" onClick={toggleMode} className={styles.textButton} disabled={loading}>
                            로그인 화면으로 돌아가기
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>이메일</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>비밀번호</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className={styles.loginButton} disabled={loading}>
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                        
                        <div style={{ textAlign: 'center', margin: '20px 0', color: '#888', fontSize: '14px' }}>또는</div>
                        
                        <button 
                            type="button" 
                            onClick={handleGoogleLogin} 
                            className={styles.googleButton} 
                            disabled={loading}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            구글 계정으로 로그인
                        </button>

                        <button type="button" onClick={toggleMode} className={styles.textButton} disabled={loading}>
                            초기 비밀번호 변경하기
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
