# LucidGo

LucidGo is a visual Go analysis tool that allows you to see AI-powered move analysis in real-time, with vary configurations that the users can adjust freely.

## Overview

Using Go AI such as KataGo is simple, but understanding the factors that affect its performance can be abstract. LucidGo aims to solve this issue by allowing users to adjust their own analysis configurations, such as the number of simulations in Monte Carlo Tree Search and the depth in MiniMax.

**Key Features:**

- **Customizable config**: Users can set their own configuration when analyzing moves.
- **Visual analysis**: Interactive Go board with real-time move analysis
- **SGF file support**: Upload and analyze games from SGF (Smart Game Format) files
- **AI-powered insights**: Leverage [LucidTree](https://github.com/YianXie/LucidTree) for move analysis and position evaluation
- **Intuitive design**: Modern, responsive UI built with React, Material-UI, and TailwindCSS

## Tech Stack

### Backend

- Python 3.12, Django 5.2+, Django REST Framework 3.16+
- HTTP client via `httpx` for KataGo API communication
- SGF parsing with `sgfmill` library
- JWT authentication with `djangorestframework-simplejwt`

### Frontend

- React 18 with Vite 7 for fast development experience
- React Router 7 for navigation
- Material-UI 7 and Tailwind CSS 4 for styling
- `@sabaki/go-board` for Go board rendering

### Tooling & DevOps

- Ruff (formatter and linter), isort, Bandit, Safety for Python quality and security
- ESLint, Prettier, and Tailwind plugins for the frontend
- Makefile helpers and `scripts/ci-local.sh` to mirror CI locally
- GitHub Actions for CI/CD

## Getting Started

### Prerequisites

- Python 3.12
- Node.js 18+ (Node 20 recommended) and npm

To verify your installation:

```bash
# Check Node.js and npm versions
node -v && npm -v

# Check Python and pip versions
python --version && pip --version
```

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/YianXie/LucidGo
cd LucidGo

# Install backend dependencies
cd backend
uv sync --dev

# Activate virtual environment
source .venv/bin/activate

# Run database migrations
python manage.py migrate

# Start the development server
python manage.py runserver
```

The API listens on `http://localhost:8000` and `http://127.0.0.1:8000`.

Create `backend/.env` following the values listed in [Environment Variables](#environment-variables) before running the server.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The SPA is served from `http://localhost:5173`.

Create `frontend/.env.local` (or `.env`) with the keys in [Environment Variables](#environment-variables) before starting Vite.

## Environment Variables

Create a `.env` file in `backend/`:

```bash
ENVIRONMENT=""          # the environment where your backend is running, use 'development' for local dev
SECRET_KEY=""           # your Django secret_key, can be regenerated if needed

# LucidTree API Configuration
API_ENDPOINT=""        # URL of your KataGo API server (e.g., http://your-ec2-instance:8080)
API_TIMEOUT=300        # Timeout in seconds for API requests (default: 300)
```

Create a `.env` file in `frontend/`:

```bash
VITE_ENVIRONMENT=""    # the environment (default is 'development')
VITE_API_URL=""        # the URL where your backend (Django REST Framework) runs
```

> The backend falls back to SQLite when `ENVIRONMENT=development`. Provide `DB_URL` for production or local PostgreSQL.

## Developer Tooling

### Makefile Commands

- `make install` – install backend and frontend dependencies
- `make lint` – run Ruff and frontend ESLint checks
- `make format` – apply Ruff format, isort, and Prettier
- `make security` – run Safety and Bandit plus `npm audit`
- `make test` – execute Django test suite
- `make ci-local` – replicate CI pipeline locally (`scripts/ci-local.sh`)
- `make run-all` — run all apps, including frontend, backend, and the AI
- `make clean` – prune caches and build artifacts

## API Surface

### Analysis

- `POST /api/analyze/` – submit a move analysis request to KataGo (public)

    <details>
    <summary>Sample Request</summary>

    ```json
    {
        "board_size": 9,
        "rules": "japanese",
        "komi": 6.5,
        "to_play": "B",
        "moves": [
            ["B", "D4"],
            ["W", "D16"]
        ],
        "algo": "mcts",
        "params": {
            "num_simulations": 500,
            "c_puct": 1.25,
            "max_time_ms": 1000,
            "temperature": 0.0,
            "random_seed": 0,
            "select_by": "visit_count"
        },
        "output": {
            "include_top_moves": 5,
            "include_policy": true,
            "include_winrate": true,
            "include_visits": true
        }
    }
    ```

    </details>

    <details>
    <summary>Sample Response</summary>

    ```json
    {
        "top_moves": [
            {
                "move": "Q3",
                "policy": 0.3518323600292206,
                "winrate": 0.03272856026887894,
                "visits": 56
            },
            {
                "move": "Q17",
                "policy": 0.15180940926074982,
                "winrate": 0.027093904092907906,
                "visits": 26
            },
            {
                "move": "R16",
                "policy": 0.12820260226726532,
                "winrate": 0.01963173970580101,
                "visits": 22
            },
            {
                "move": "R4",
                "policy": 0.13219143450260162,
                "winrate": 0.01938430592417717,
                "visits": 21
            },
            {
                "move": "Q4",
                "policy": 0.10890644043684006,
                "winrate": 0.030727697536349297,
                "visits": 16
            }
        ],
        "algorithm": "mcts",
        "stats": {
            "model": "checkpoint_19x19",
            "num_simulations": 500,
            "c_puct": 1.25,
            "dirichlet_alpha": 0.0,
            "dirichlet_epsilon": 0.0,
            "value_weight": 1.0,
            "policy_weight": 1.0,
            "select_by": "visit_count",
            "include_visits": true,
            "simulations_run": 154,
            "max_time_ms": 1000,
            "policy": [
                8.48091731313616e-5, 0.00011868352157762274,
                9.970022074412555e-5, 0.00010437508171889931,
                0.00010991421004291624, 9.189730189973488e-5,
                8.829159924061969e-5, 8.148477354552597e-5,
                7.697017281316221e-5, 7.801960600772873e-5,
                7.818383892299607e-5, 8.145595347741619e-5, 8.59393403516151e-5,
                0.00010544621909502894, 0.00013809437223244458,
                0.00011695632565533742, 8.254143176600337e-5,
                7.524532702518627e-5, 9.242323721991852e-5,
                8.257347508333623e-5, 8.103453001240268e-5,
                7.685984746785834e-5, 0.0001048825797624886,
                0.00010394576383987442, 8.335327584063634e-5,
                8.082351996563375e-5, 7.773278048262e-5, 7.308540807571262e-5,
                7.472764991689473e-5, 7.285228639375418e-5,
                7.590306631755084e-5, 8.032344339881092e-5,
                0.00010009100515162572, 9.168387623503804e-5,
                7.495462341466919e-5, 8.157597767421976e-5, 8.23539012344554e-5,
                8.843359682941809e-5, 8.371367584913969e-5, 8.0644509580452e-5,
                7.368201477220282e-5, 8.635925041744485e-5,
                8.756091119721532e-5, 0.0001352237450191751,
                8.96780620678328e-5, 8.422601968050003e-5, 9.187066461890936e-5,
                0.00010675920930225402, 0.00010251337516820058,
                0.0001272595691261813, 0.00019579681975301355,
                0.0011820943327620625, 0.010151753202080727, 0.3518323600292206,
                0.00027563105686567724, 5.4281546908896416e-5,
                9.38984812819399e-5, 8.909897587727755e-5, 9.101673640543595e-5,
                0.00010098547500092536, 0.00014368303527589887,
                0.00010136564378626645, 0.00010102188389282674,
                7.297041884157807e-5, 6.188886618474498e-5,
                6.803101859986782e-5, 0.00014516316878143698,
                0.00015660384087823331, 0.00013248540926724672,
                0.00013313903764355928, 0.0007714091916568577,
                0.006393783260136843, 0.10890644043684006, 0.13219143450260162,
                4.393800190882757e-5, 7.894160808064044e-5,
                8.817371417535469e-5, 8.938826067605987e-5,
                8.550564962206408e-5, 0.000125785285490565,
                0.00010980598744936287, 8.420521771768108e-5,
                8.301904745167121e-5, 8.60142899909988e-5, 8.421742677455768e-5,
                8.378156053368002e-5, 8.608624921180308e-5, 9.30840105866082e-5,
                0.00010639523679856211, 0.00013342121383175254,
                0.00016664114082232118, 0.0025803425814956427,
                0.0012387220049276948, 5.424102710094303e-5,
                6.740504613844678e-5, 8.102502761175856e-5,
                8.400694059673697e-5, 9.294491610489786e-5,
                8.750014239922166e-5, 7.711660146014765e-5,
                7.234892837004736e-5, 7.276763790287077e-5,
                7.984648254932836e-5, 7.47939629945904e-5, 7.04536578268744e-5,
                7.201787957455963e-5, 7.352617831202224e-5,
                7.696921966271475e-5, 8.629306103102863e-5,
                9.713244071463123e-5, 0.00012038346176268533,
                0.00010989953443640843, 7.24987403373234e-5,
                7.673227082705125e-5, 7.882372301537544e-5,
                9.409309132024646e-5, 9.053307439899072e-5,
                8.931711636250839e-5, 8.048001473071054e-5,
                8.529674960300326e-5, 9.003935701912269e-5,
                7.909646956250072e-5, 7.163237751228735e-5,
                7.117782661225647e-5, 7.638575334567577e-5, 7.65992735978216e-5,
                7.709013152634725e-5, 7.748121424810961e-5,
                9.146991214947775e-5, 0.00010171405301662162,
                7.822903717169538e-5, 8.368230191990733e-5,
                8.538481051800773e-5, 8.192165842046961e-5, 8.453092596028e-5,
                7.310847286134958e-5, 7.144891424104571e-5,
                8.146115578711033e-5, 8.093976066447794e-5,
                8.675854041939601e-5, 7.962208474054933e-5,
                7.412123522954062e-5, 7.620079850312322e-5,
                8.163606253219768e-5, 8.089901530183852e-5,
                8.157100091921166e-5, 7.693222869420424e-5,
                8.848328434396535e-5, 9.034160029841587e-5, 7.30281972209923e-5,
                8.426072599831969e-5, 8.561017602914944e-5,
                8.795006579020992e-5, 7.184172136476263e-5,
                7.356798596447334e-5, 7.516342884628102e-5,
                7.864832150517032e-5, 7.986453420016915e-5,
                8.511594933224842e-5, 8.444864943157881e-5,
                7.844756328267977e-5, 7.969790021888912e-5,
                8.022353722481057e-5, 8.058945968514308e-5,
                8.220160088967532e-5, 7.955938781378791e-5, 9.1453519416973e-5,
                9.192692959913984e-5, 7.221622945507988e-5,
                8.563312439946458e-5, 8.55352554935962e-5, 8.458745287498459e-5,
                8.423373219557106e-5, 9.803841385291889e-5,
                7.728608761681244e-5, 7.793817349011078e-5, 8.23775480967015e-5,
                8.432270988123491e-5, 8.302609785459936e-5,
                8.327167597599328e-5, 8.024480484891683e-5,
                7.769364310661331e-5, 7.870324043324217e-5,
                8.142861042870209e-5, 7.993745384737849e-5,
                9.274375042878091e-5, 9.285472333431244e-5,
                7.186186849139631e-5, 8.554210944566876e-5,
                8.493795758113265e-5, 8.228089427575469e-5,
                8.210547093767673e-5, 0.00012377926032058895,
                9.165424853563309e-5, 8.807404083199799e-5,
                8.023731061257422e-5, 8.384574903175235e-5,
                8.069151226663962e-5, 8.812789747025818e-5,
                8.281045302283019e-5, 7.742957677692175e-5, 7.7921969932504e-5,
                8.094694203464314e-5, 7.962588279042393e-5,
                9.328511805506423e-5, 9.295901691075414e-5,
                7.120417285477743e-5, 8.460455865133554e-5,
                8.522990538040176e-5, 8.637745486339554e-5,
                7.782037573633716e-5, 0.00010014534200308844,
                0.00010976378689520061, 9.854967356659472e-5,
                8.586020703660324e-5, 8.617562707513571e-5,
                8.690362301422283e-5, 8.869813609635457e-5,
                8.361760410480201e-5, 7.869835826568305e-5, 7.62255149311386e-5,
                7.990300218807533e-5, 7.978368375916034e-5,
                9.264624532079324e-5, 0.0001014002482406795,
                7.758480933262035e-5, 8.398147474508733e-5,
                8.409952715737745e-5, 8.476688526570797e-5,
                8.547059405827895e-5, 9.859845886239782e-5,
                0.0001239375997101888, 0.00010264779120916501,
                9.413132647750899e-5, 8.669254020787776e-5,
                9.249051799997687e-5, 8.906533184926957e-5,
                8.571302896598354e-5, 8.159270510077477e-5, 7.95433807070367e-5,
                8.01871283329092e-5, 8.133734081638977e-5, 9.48023225646466e-5,
                9.941386815626174e-5, 9.301736281486228e-5,
                8.027673175092787e-5, 8.098623948171735e-5, 7.45956422179006e-5,
                0.0001051291183102876, 0.002829889999702573,
                0.00016253464855253696, 8.590165089117363e-5,
                8.771553984843194e-5, 9.115563443629071e-5,
                8.633965626358986e-5, 8.831476588966325e-5,
                8.868274744600058e-5, 8.729052933631465e-5,
                8.499118848703802e-5, 8.586553303757682e-5,
                8.720772893866524e-5, 0.00011116266250610352,
                0.0001854958973126486, 0.00014672806719318032,
                8.256481669377536e-5, 7.74504806031473e-5, 8.936200174503028e-5,
                0.00012416178651619703, 0.00012023218005197123,
                0.00013039709301665425, 8.818187052384019e-5,
                0.000109705506474711, 8.840711234370247e-5,
                8.219925075536594e-5, 8.766685641603544e-5,
                8.982665167422965e-5, 8.674572018207982e-5,
                8.595434337621555e-5, 9.122285700868815e-5,
                9.714365296531469e-5, 0.00017150412895716727,
                0.0008859917870722711, 0.0021561605390161276,
                6.792152998968959e-5, 6.902707536937669e-5,
                7.930940046207979e-5, 0.00011909021122846752,
                0.00022173899924382567, 8.235649147536606e-5,
                9.737970685819164e-5, 0.00010193604248343036,
                9.693495667306706e-5, 8.09566699899733e-5, 8.830532897263765e-5,
                8.989306661533192e-5, 8.735314622754231e-5,
                8.703384082764387e-5, 9.349441825179383e-5,
                0.00012753768533002585, 0.0007127823191694915,
                0.0565904900431633, 0.12820260226726532, 4.2095645767403767e-5,
                7.226403977256268e-5, 8.276939479401335e-5,
                0.0001358280424028635, 0.00010790584201458842,
                0.00011963702127104625, 0.00010106332774739712,
                0.0017697399016469717, 0.00010204059799434617,
                7.377327710855752e-5, 7.873641879996285e-5,
                8.927810267778113e-5, 9.873462113318965e-5,
                0.000112218338472303, 0.00012491508095990866,
                0.0004638792888727039, 0.008200022391974926,
                0.15180940926074982, 0.0002534640079829842,
                5.173844692762941e-5, 7.218358950922266e-5,
                5.536635217140429e-5, 8.296910527860746e-5,
                7.888276013545692e-5, 0.0001031172796501778,
                0.00012607622193172574, 8.521178096998483e-5,
                8.193095709430054e-5, 7.557882054243237e-5,
                7.255843229359016e-5, 7.544134859926999e-5,
                7.619004463776946e-5, 7.6735632319469e-5, 7.795891724526882e-5,
                0.00010189999011345208, 8.518261165590957e-5,
                6.780284456908703e-5, 6.723734986735508e-5,
                5.3065396059537306e-5, 7.539740181528032e-5,
                0.00017588966875337064, 0.0001033274456858635,
                9.854008385445923e-5, 0.00010804176417877898,
                0.00011014579649781808, 0.00010742335871327668,
                9.535215940559283e-5, 7.49261089367792e-5, 6.898331048432738e-5,
                7.051724242046475e-5, 7.283018931047991e-5,
                7.738461863482371e-5, 8.469472959404811e-5,
                0.00010082794324262068, 0.00010086497059091926,
                8.463990525342524e-5, 7.114755862858146e-5,
                7.367787475232035e-5, 7.574159826617688e-5, 7.79554175096564e-5
            ],
            "winrate": 0.016697337850928307,
            "elapsed_ms": 1041.68
        }
    }
    ```

    </details>

### Game Data

- `POST /api/get-game-data/` – parse SGF file data and extract game information (public)

          <details>
          <summary>Sample Request</summary>

    ```txt
    "(;RU[korean]RE[W+R]KM[6.5]PW[Player_1]PB[Player_2]SZ[19];B[pd];W[pp];B[cd];W[dp];B[qf];W[ed];B[hc];W[df];B[cf];W[cg];B[bg];W[ch];B[bf];W[qk])"
    ```

    </details>

    <details>
    <summary>Sample Response</summary>

    ```json
    {
        "moves": [
            ["b", [15, 15]],
            ["w", [3, 15]],
            ["b", [15, 2]],
            ["w", [3, 3]],
            ["b", [13, 16]],
            ["w", [15, 4]],
            ["b", [16, 7]],
            ["w", [13, 3]],
            ["b", [13, 2]],
            ["w", [12, 2]],
            ["b", [12, 1]],
            ["w", [11, 2]],
            ["b", [13, 1]],
            ["w", [8, 16]]
        ],
        "size": 19,
        "komi": 6.5,
        "players": {
            "black": "Player_2",
            "white": "Player_1"
        },
        "winner": "w"
    }
    ```

    </details>

## Support

Questions or issues? Email [yianxie52@gmail.com](mailto:yianxie52@gmail.com) or open a GitHub Issue on this repository.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
