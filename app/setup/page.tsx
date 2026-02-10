'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, Loader2, CheckCircle } from 'lucide-react'

export default function SetupPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        // Check if setup is needed
        fetch('/api/auth/setup')
            .then(res => res.json())
            .then(data => {
                if (!data.needsSetup) {
                    router.push('/login')
                }
                setChecking(false)
            })
            .catch(() => setChecking(false))
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to create user')
            }

            router.push('/login')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (checking) {
        return (
            <div className="loading-container">
                <Loader2 size={32} className="spinner" />
                <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary);
          }
          .spinner {
            animation: spin 1s linear infinite;
            color: var(--accent-primary);
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        )
    }

    return (
        <div className="setup-container">
            <div className="setup-card glass-card animate-slide-up">
                <div className="setup-header">
                    <div className="setup-badge">
                        <CheckCircle size={20} />
                        Initial Setup
                    </div>
                    <h1>Create Admin Account</h1>
                    <p>Set up your administrator credentials to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="setup-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label className="label">Username</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                className="input input-with-icon"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                minLength={3}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                className="input input-with-icon"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                className="input input-with-icon"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary setup-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="spinner" />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>
            </div>

            <style jsx>{`
        .setup-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: var(--bg-primary);
          background-image: 
            radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
        }

        .setup-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
        }

        .setup-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .setup-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(34, 197, 94, 0.15);
          color: var(--success);
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .setup-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .setup-header p {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .setup-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: var(--error);
          font-size: 14px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .input-with-icon {
          padding-left: 44px;
        }

        .setup-btn {
          width: 100%;
          padding: 14px;
          font-size: 15px;
          margin-top: 8px;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}
