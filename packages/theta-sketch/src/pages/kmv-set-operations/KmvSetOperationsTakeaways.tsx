import { Box, Paper, Typography } from "@mui/material";

const KmvSetOperationsTakeaways = () => {
    return (
        <Box>
            <Paper
                variant="outlined"
                sx={{
                    p: 2.5,
                    background: "transparent",
                }}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                    Why Theta Sketch
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    To make intersection and difference composable, we must store θ explicitly in the sketch. That leads to Theta Sketch:
                    <br />
                    <strong>Theta Sketch = KMV values + stored θ</strong>.
                </Typography>
            </Paper>
        </Box>
    );
};

export default KmvSetOperationsTakeaways;
