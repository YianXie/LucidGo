import api from "@/api";
import { GAMES_URL } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import usePageTitle from "@/hooks/usePageTitle";
import type { GameSummary } from "@/types/game";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const GameCard = ({ game }: { game: GameSummary }) => {
    const navigate = useNavigate();

    return (
        <Card variant="outlined">
            <CardContent sx={{ pb: 1 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                >
                    <Typography variant="subtitle1" fontWeight={600}>
                        {game.name || "Untitled Game"}
                    </Typography>
                    <Chip
                        label={
                            game.analysis_count === 1
                                ? "1 analysis"
                                : `${game.analysis_count} analyses`
                        }
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                </Stack>
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mt: 1 }}
                    flexWrap="wrap"
                    useFlexGap
                >
                    <Typography variant="body2" color="text.secondary">
                        <strong>Black:</strong> {game.black_player}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>White:</strong> {game.white_player}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Result:</strong> {game.winner}
                    </Typography>
                    {game.komi != null && (
                        <Typography variant="body2" color="text.secondary">
                            <strong>Komi:</strong> {game.komi}
                        </Typography>
                    )}
                </Stack>
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mt: 1 }}
                    flexWrap="wrap"
                    useFlexGap
                >
                    <Typography variant="caption" color="text.disabled">
                        Created {formatDate(game.created_at)}
                    </Typography>
                    {game.last_analyzed_at && (
                        <Typography variant="caption" color="text.disabled">
                            Last analyzed {formatDate(game.last_analyzed_at)}
                        </Typography>
                    )}
                </Stack>
            </CardContent>
            <CardActions>
                <Button
                    size="small"
                    startIcon={<OpenInNewIcon />}
                    onClick={() => navigate(`/analyze/?gameID=${game.id}`)}
                >
                    Load
                </Button>
            </CardActions>
        </Card>
    );
};

const GameSection = ({
    title,
    games,
    defaultExpanded = true,
}: {
    title: string;
    games: GameSummary[];
    defaultExpanded?: boolean;
}) => {
    return (
        <Accordion defaultExpanded={defaultExpanded} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" component="h3">
                    {title}
                </Typography>
                <Chip
                    label={games.length}
                    size="small"
                    sx={{ ml: 1.5, alignSelf: "center" }}
                />
            </AccordionSummary>
            <AccordionDetails>
                {games.length === 0 ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 2, textAlign: "center" }}
                    >
                        No games yet.
                    </Typography>
                ) : (
                    <Stack spacing={2}>
                        {games.map((game) => (
                            <GameCard key={game.id} game={game} />
                        ))}
                    </Stack>
                )}
            </AccordionDetails>
        </Accordion>
    );
};

const ProfileSkeleton = () => {
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 4 }}
            >
                <Skeleton variant="circular" width={64} height={64} />
                <Skeleton variant="text" width={200} height={32} />
            </Stack>
            <Skeleton variant="text" width={180} height={36} sx={{ mb: 2 }} />
            {[1, 2].map((i) => (
                <Skeleton
                    key={i}
                    variant="rounded"
                    height={120}
                    sx={{ mb: 2 }}
                />
            ))}
        </Container>
    );
};

const Profile = () => {
    usePageTitle("Profile");
    const { user } = useAuth();
    const email = (user?.email as string) ?? "";

    const [games, setGames] = useState<GameSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGames = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get<GameSummary[]>(GAMES_URL);
            setGames(data);
        } catch (error) {
            console.error("Failed to fetch games:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchGames();
    }, [fetchGames]);

    const uploadedGames = games.filter((g) => g.source === "upload");
    const lives = games.filter((g) => g.source === "live");

    if (loading) {
        return <ProfileSkeleton />;
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" spacing={2.5} alignItems="center">
                <Avatar sx={{ width: 64, height: 64, fontSize: 28 }}>
                    {email.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight={600}>
                        {email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {games.length === 1
                            ? "1 game analyzed"
                            : `${games.length} games analyzed`}
                    </Typography>
                </Box>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                Analysis History
            </Typography>

            <Stack spacing={1}>
                <GameSection
                    title="Uploaded Games"
                    games={uploadedGames}
                    defaultExpanded={true}
                />
                <GameSection
                    title="Live Games"
                    games={lives}
                    defaultExpanded={true}
                />
            </Stack>
        </Container>
    );
};

export default Profile;
