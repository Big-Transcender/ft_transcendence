#zsh_config

setopt correct
setopt auto_cd

#History

HISTSIZE=1000              # Number of commands to remember in the current session
SAVEHIST=2000              # Number of commands to save in the history file
HISTFILE=~/.zsh_history    # File where the history is saved

# Append to the history file, don't overwrite it
setopt append_history

# Share history across all sessions
setopt share_history

# Automatically save history after each command
setopt inc_append_history


#alias

alias vconf="vim $HOME/.config/nvim"
alias tidal="$HOME/bin/tidal-hifi-5.9.0.AppImage"
alias vim="$HOME/bin/nvim.appimage"
alias videdit="$HOME/bin/OpenShot-v3.1.1-x86_64.AppImage"
alias cowsay="$HOME/sgoinfre/homebrew/var/homebrew/linked/cowsay/bin/cowsay"
alias fortune="$HOME/sgoinfre/homebrew/var/homebrew/linked/fortune/bin/fortune"
alias code="/home/diogosan/sgoinfre/Downloads/code-insider-x64-1711603566/VSCode-linux-x64/bin/code-insiders"


#path_config

path=(
    $path
    $HOME/bin
    $HOME/bin/starship
)

export PATH="$HOME/sgoinfre/homebrew/bin:$PATH"

if [ -x $HOME/sgoinfre/homebrew/var/homebrew/linked/cowsay/bin/cowsay -a -x $HOME/sgoinfre/homebrew/var/homebrew/linked/fortune/bin/fortune ]; then
    # Get the path to cowsay cows directory
    COWS_DIR="$HOME/sgoinfre/homebrew/var/homebrew/linked/cowsay/share/cows"
    
    # Check if the cows directory exists
    if [ -d "$COWS_DIR" ]; then
        MAX_TRIES=5   # Max number of retries
        TRY_COUNT=0   # Counter for retries

        while [ $TRY_COUNT -lt $MAX_TRIES ]; do
            # Pick a random cow file, suppress errors
            RANDOM_COW=$(ls "$COWS_DIR" 2>/dev/null | shuf -n 1 2>/dev/null)

            # Check if RANDOM_COW is not empty
            if [ -n "$RANDOM_COW" ]; then
                # Try to run cowsay with the random cow, suppressing errors
                if fortune -s| cowsay -f "$RANDOM_COW" 2>/dev/null; then
                    break  # Success, exit the loop
                fi
            fi

            # Increment retry count
            TRY_COUNT=$((TRY_COUNT + 1))
        done

        # If the loop finishes without success, use the default cow
        if [ $TRY_COUNT -eq $MAX_TRIES ]; then
            fortune -s | cowsay 2>/dev/null
        fi
    else
        # Fallback to default cowsay if no cows directory found
        fortune -s | cowsay 2>/dev/null
    fi
fi



#starship

eval "$(starship init zsh)"
eval "$(starship init zsh)"


