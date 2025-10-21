/**
 * All the 19 letters in the GTP coords system (exclude 'i')
 */
export const GTPLetters = "ABCDEFGHJKLMNOPQRST";

/**
 * A sample SGF file content
 */
export const SGFSample =
    "(;GK[2]TP[0]EV[rank game]CDT[30]TML[600]TM[600-30-3]RC[0]WCC[2]CDN[3]BID[???T??��?0]CNT[248]RU[korean]RE[W+R]DT[2025-08-10-15-09-18]KM[6.5]EVF[0]PCF[0]WID[Username]WR[22]WAVA[629]PW[Player_1]BCC[2]BR[22]PB[Player_2]BAVA[60004]GTM[2025:08:10:15:09]AP[New Tygem]SZ[19];B[pd];W[pp];B[cd];W[dp];B[qf];W[ed];B[hc];W[df];B[cf];W[cg];B[bg];W[ch];B[bf];W[de];B[bh];W[ci];B[he];W[ce];B[be];W[cc];B[bc];W[dc];B[bb];W[gh];B[ck];W[bi];B[cn];W[co];B[dn];W[fq];B[fo];W[ob];B[nc];W[nb];B[mc];W[qc];B[pc];W[pb];B[qd];W[rc];B[gq];W[fp];B[gp];W[gr];B[hr];W[fr];B[go];W[bo];B[nq];W[qn];B[pr];W[qq];B[qr];W[qk])";

/**
 * The link to the GitHub repo
 */
export const GitHubRepositoryLink = "https://github.com/YianXie/LucidGo";

/**
 * Main content's padding top to avoid the header
 */
export const paddingTop = 100;

/**
 * The links to the videos in the video blog page
 */
export const videoData = {
    introduction:
        "https://www.youtube-nocookie.com/embed/4U45FKlvA5s?si=VpVyqVCL4kOB-Mn7",
    placeholder1:
        "https://www.youtube-nocookie.com/embed/NpEaa2P7qZI?si=kGS1pD4WugClEe-r",
    placeholder2:
        "https://www.youtube-nocookie.com/embed/NpEaa2P7qZI?si=kGS1pD4WugClEe-r",
    placeholder3:
        "https://www.youtube-nocookie.com/embed/NpEaa2P7qZI?si=kGS1pD4WugClEe-r",
    placeholder4:
        "https://www.youtube-nocookie.com/embed/NpEaa2P7qZI?si=kGS1pD4WugClEe-r",
    placeholder5:
        "https://www.youtube-nocookie.com/embed/NpEaa2P7qZI?si=kGS1pD4WugClEe-r",
    placeholder6:
        "https://www.youtube-nocookie.com/embed/NpEaa2P7qZI?si=kGS1pD4WugClEe-r",
    placeholder7:
        "https://www.youtube-nocookie.com/embed/NpEaa2P7qZI?si=kGS1pD4WugClEe-r",
    placeholder8:
        "https://www.youtube-nocookie.com/embed/NpEaa2P7qZI?si=kGS1pD4WugClEe-r",
    placeholder9:
        "https://www.youtube-nocookie.com/embed/NpEaa2P7qZI?si=kGS1pD4WugClEe-r",
    placeholder10:
        "https://www.youtube-nocookie.com/embed/NpEaa2P7qZI?si=kGS1pD4WugClEe-r",
};

/**
 * Transcript data for videos
 * Each transcript is an array of objects with timestamp and text
 */
export const transcriptData = {
    introduction: [
        {
            timestamp: "0:00",
            text: "Welcome to LucidGo! In this introduction video, we'll explore what makes LucidGo a powerful tool for analyzing Go games.",
        },
        {
            timestamp: "0:15",
            text: "LucidGo is built on top of KataGo, one of the strongest Go AI engines in the world. It provides real-time visual analysis to help you understand the game better.",
        },
        {
            timestamp: "0:35",
            text: "With features like win rate tracking, policy network visualization, and territory prediction, you can see exactly how the AI thinks about each position.",
        },
        {
            timestamp: "0:55",
            text: "Whether you're a beginner looking to improve or an experienced player analyzing high-level games, LucidGo makes AI analysis accessible and understandable.",
        },
        {
            timestamp: "1:15",
            text: "Let's dive in and see how LucidGo can transform the way you study Go!",
        },
    ],
};
