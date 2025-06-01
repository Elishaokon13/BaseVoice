'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Eye, EyeOff, Loader2, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const categories = [
    { id: 'all', label: 'All Categories', icon: '📝' },
    { id: 'speed_performance', label: 'Speed & Performance', icon: '⚡' },
    { id: 'ease_of_use', label: 'Ease of Use', icon: '🎯' },
    { id: 'ideas_requests', label: 'Ideas & Requests', icon: '💡' },
    { id: 'community_support', label: 'Community & Support', icon: '🤝' },
    { id: 'developer_experience', label: 'Developer Experience', icon: '⚙️' },
    { id: 'other', label: 'Other', icon: '📝' }
]

interface Feedback {
    id: string
    feedback: string
    category: string
    created_at: string
}

export default function FeedbackPage() {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [isCorrect, setIsCorrect] = useState(true)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [showRetry, setShowRetry] = useState(false)


    const [page, setPage] = useState(1)

    const handlePasswordSubmit = async () => {
        if (!password.trim()) return

        setIsLoading(true)
        setShowRetry(false)

        try {
            const params = new URLSearchParams({
                password: password.trim(),
                searchTerm: '',
                category: 'all',
                page: '1',
                limit: '20'
            })
            const response = await fetch(`/api/view-feedback?${params.toString()}`)

            const data = await response.json()

            if (response.ok) {
                setFeedbacks(data.feedbacks || [])
                setHasMore(data.hasMore)
                setIsAuthenticated(true)
                setPage(1)
            } else {
                console.error('Error fetching feedbacks:', data.error)
                setShowRetry(true)
                if (data.error === 'Invalid password') {
                    setIsCorrect(false)
                }
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const loadMoreFeedbacks = async () => {
        if (!hasMore || loadingMore) return

        setLoadingMore(true)
        try {
            const params = new URLSearchParams({
                password: password.trim(),
                searchTerm,
                category: selectedCategory,
                page: String(page + 1),
                limit: '20'
            })
            const response = await fetch(`/api/view-feedback?${params.toString()}`)

            const data = await response.json()

            if (response.ok) {
                setFeedbacks(prev => [...prev, ...data.feedbacks])
                setHasMore(data.hasMore)
                setPage(prev => prev + 1)
            }
        } catch (error) {
            console.error('Error loading more:', error)
        } finally {
            setLoadingMore(false)
        }
    }

    const loadAllFeedbacks = async () => {
        if (!hasMore || loadingMore) return

        setLoadingMore(true)
        try {
            // Load all remaining in one go
            const params = new URLSearchParams({
                password: password.trim(),
                searchTerm,
                category: selectedCategory,
                page: '1',
                limit: '1000' // Large limit to get all feedbacks
            })
            const response = await fetch(`/api/view-feedback?${params.toString()}`)

            const data = await response.json()

            if (response.ok) {
                setFeedbacks(data.feedbacks)
                setHasMore(false) // No more to load
                setPage(1)
            }
        } catch (error) {
            console.error('Error loading all:', error)
        } finally {
            setLoadingMore(false)
        }
    }

    const handleSearch = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                password: password.trim(),
                searchTerm,
                category: selectedCategory,
                page: '1',
                limit: '20'
            })
            const response = await fetch(`/api/view-feedback?${params.toString()}`)

            const data = await response.json()

            if (response.ok) {
                setFeedbacks(data.feedbacks)
                setHasMore(data.hasMore)
                setPage(1)
            }
        } catch (error) {
            console.error('Error searching:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getCategoryLabel = (categoryId: string) => {
        return categories.find(cat => cat.id === categoryId)?.label || categoryId
    }

    useEffect(() => {
        if (isAuthenticated) {
            handleSearch()
        }
    }, [selectedCategory])

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background">
                <div className="h-16 sm:h-20"></div>

                <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="text-center mb-8 sm:mb-12">
                        <h1 className="text-3xl sm:text-4xl font-bold font-coinbase mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#0052FF] to-[#2151F5]">
                            BaseVoice
                        </h1>
                        <p className="text-base sm:text-lg text-muted-foreground mb-2">
                            View Encrypted Feedback
                        </p>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Enter the decryption password to view secure feedback submissions.
                        </p>
                    </div>

                    <Card className="backdrop-blur-sm bg-white/50 dark:bg-black/50 border-2 border-primary/10 shadow-xl shadow-primary/5">
                        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-xs sm:text-sm font-mono font-medium">
                                    Password
                                </label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                                    placeholder="Enter decryption password"
                                    className="bg-white/50 dark:bg-black/50 border-2 border-primary/10 hover:border-primary/30 transition-colors"
                                />
                            </div>
                            <Button
                                onClick={handlePasswordSubmit}
                                disabled={!password.trim() || isLoading}
                                className="w-full font-coinbase-mono text-base hover:cursor-pointer disabled:!cursor-not-allowed bg-primary hover:bg-primary/90 transition-colors"
                                size="lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Decrypting...
                                    </>
                                ) : (
                                    'Decrypt Feedback'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="h-16 sm:h-20"></div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-16 sm:pb-24">
                <div className="mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold font-coinbase mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#0052FF] to-[#2151F5]">
                        BaseVoice
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground mb-2">
                        Secure Feedback Portal
                    </p>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        View decrypted feedback submissions
                    </p>
                </div>

                {/* Wrong password alert */}
                {!isCorrect && (
                    <Alert className="mb-6">
                        <AlertCircle className="h-4 w-4 mt-1.75" />
                        <AlertDescription className="flex items-center justify-between">
                            <span className='text-destructive'>Seeing gibberish? It's because you entered the wrong password ;)</span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setIsAuthenticated(false)
                                    setPassword('')
                                    setFeedbacks([])
                                }}
                                className="ml-4 hover:cursor-pointer"
                            >
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Search and Filter */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search feedback..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10 bg-white/50 dark:bg-black/50 border-2 border-primary/10 hover:border-primary/30 transition-colors"
                        />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                        <label className="text-xs sm:text-sm font-mono font-medium">
                            Filter by Category
                        </label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="bg-white/50 dark:bg-black/50 border-2 border-primary/10 hover:border-primary/30 transition-colors">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent className="bg-white/80 dark:bg-black/80 backdrop-blur-lg border-2 border-primary/10">
                                <SelectItem value="all" className="hover:bg-primary/10 transition-colors">
                                    All Categories
                                </SelectItem>
                                {categories.map((category) => (
                                    <SelectItem 
                                        key={category.id} 
                                        value={category.id}
                                        className="hover:bg-primary/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{category.icon}</span>
                                            <span className="font-medium">{category.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button 
                        onClick={handleSearch} 
                        disabled={isLoading}
                        className="font-coinbase-mono text-base hover:cursor-pointer disabled:!cursor-not-allowed bg-primary hover:bg-primary/90 transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Searching...
                            </>
                        ) : (
                            'Search'
                        )}
                    </Button>
                </div>

                {/* Feedback List */}
                <div className="space-y-4">
                    <ul className="space-y-4 sm:space-y-6">
                        {feedbacks.map((feedback) => (
                            <li key={feedback.id} className="border-b border-primary/10 pb-4 sm:pb-6">
                                <p className="text-sm sm:text-base mb-3">{feedback.feedback}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="gap-1.5 w-fit">
                                        <span className="text-base">{categories.find(cat => cat.id === feedback.category)?.icon}</span>
                                        <span className="font-medium">{getCategoryLabel(feedback.category)}</span>
                                    </Badge>
                                </div>
                            </li>
                        ))}                    
                    </ul>
                </div>

                {/* Load More */}
                {feedbacks.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No feedback found</p>
                    </div>
                )}

                {hasMore && feedbacks.length > 0 && (
                    <div className="text-center mt-8 space-y-4">
                        <Button
                            onClick={() => loadAllFeedbacks()}
                            disabled={loadingMore}
                            className="font-mono hover:cursor-pointer"
                        >
                            Load All Feedback
                        </Button>
                        <Button
                            onClick={loadMoreFeedbacks}
                            disabled={loadingMore}
                            variant="outline"
                            className="font-coinbase-mono text-base hover:cursor-pointer disabled:!cursor-not-allowed border-2 border-primary/10 hover:bg-primary/10 transition-colors"
                        >
                            {loadingMore ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                'Load More'
                            )}
                        </Button>

                        <Button
                            onClick={() => loadAllFeedbacks()}
                            disabled={loadingMore}
                            className="font-mono hover:cursor-pointer"
                        >
                            Load All Feedback
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}