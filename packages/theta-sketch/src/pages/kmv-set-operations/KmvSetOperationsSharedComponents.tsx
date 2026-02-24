import { Box, Typography } from "@mui/material";

export function KmvSetOperationHeader({ title, description }: { title: string, description: string }) {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: window.innerHeight / 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                width: { xs: '92%', md: 920 },
                pointerEvents: 'none',
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    textAlign: 'center',
                    fontWeight: 800,
                    letterSpacing: -0.5,
                    mb: 1,
                }}
            >
                {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                {description}
            </Typography>
        </Box>
    );
}   
